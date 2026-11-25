import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import YahooFinance from "yahoo-finance2";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

async function getUserIdFromCookie() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function GET() {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

    const enriched = await Promise.all(
      items.map(async (item: any) => {
        try {
          const quote = (await yahooFinance.quote(item.symbol)) as Record<string, any>;
          const price = quote.regularMarketPrice ?? 0;
          const prev = quote.regularMarketPreviousClose ?? price;
          const changePercent = prev ? ((price - prev) / prev) * 100 : 0;

          return {
            _id: item._id,
            symbol: item.symbol,
            name: item.name || quote.shortName || item.symbol,
            notes: item.notes || "",
            alertAbove: item.alertAbove ?? null,
            alertBelow: item.alertBelow ?? null,
            addedAt: item.addedAt,
            price: Number(price.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            high52: quote.fiftyTwoWeekHigh ? Number(quote.fiftyTwoWeekHigh.toFixed(2)) : null,
            low52: quote.fiftyTwoWeekLow ? Number(quote.fiftyTwoWeekLow.toFixed(2)) : null,
            pe: quote.trailingPE ? Number(quote.trailingPE.toFixed(2)) : null,
          };
        } catch {
          return {
            _id: item._id,
            symbol: item.symbol,
            name: item.name || item.symbol,
            notes: item.notes || "",
            alertAbove: item.alertAbove ?? null,
            alertBelow: item.alertBelow ?? null,
            addedAt: item.addedAt,
            price: null,
            changePercent: 0,
            high52: null,
            low52: null,
            pe: null,
          };
        }
      })
    );

    return NextResponse.json({ success: true, items: enriched });
  } catch (error) {
    console.error("Watchlist GET error:", error);
    return NextResponse.json({ error: "Failed to load watchlist" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const symbol = body.symbol?.trim().toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectDB();
    const item = await Watchlist.findOneAndUpdate(
      { userId, symbol },
      {
        $set: {
          name: body.name || symbol,
          notes: body.notes ?? "",
          ...(body.alertAbove !== undefined ? { alertAbove: body.alertAbove } : {}),
          ...(body.alertBelow !== undefined ? { alertBelow: body.alertBelow } : {}),
        },
        $setOnInsert: { addedAt: new Date() },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Watchlist POST error:", error);
    return NextResponse.json({ error: "Failed to save to watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const symbol = body.symbol?.trim().toUpperCase();
    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    await connectDB();
    await Watchlist.deleteOne({ userId, symbol });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Watchlist DELETE error:", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
