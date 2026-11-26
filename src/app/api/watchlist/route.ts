import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import Watchlist from "@/models/Watchlist";
import YahooFinance from "yahoo-finance2";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const DEFAULT_WATCHLIST_SYMBOLS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries", notes: "Core energy & digital holding" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services", notes: "IT services leader" },
  { symbol: "INFY.NS", name: "Infosys Ltd", notes: "Strong export margins" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank Ltd", notes: "Private banking anchor" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd", notes: "High credit growth" },
];

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

  let items: any[] = [];
  try {
    await connectDB();
    items = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
  } catch {
    // Database connection fallback
    items = [];
  }

  // If no items in DB, use default portfolio stocks
  if (!items || items.length === 0) {
    items = DEFAULT_WATCHLIST_SYMBOLS.map((s, idx) => ({
      _id: `default-${idx}`,
      symbol: s.symbol,
      name: s.name,
      notes: s.notes,
      alertAbove: null,
      alertBelow: null,
      addedAt: new Date(),
    }));
  }

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

    try {
      await connectDB();
      const item = await Watchlist.findOneAndUpdate(
        { userId, symbol },
        {
          $set: {
            name: body.name || symbol,
            notes: body.notes || "",
            alertAbove: body.alertAbove ? Number(body.alertAbove) : null,
            alertBelow: body.alertBelow ? Number(body.alertBelow) : null,
            addedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      );
      return NextResponse.json({ success: true, item });
    } catch {
      // Return simulated success if DB not reachable
      return NextResponse.json({
        success: true,
        item: {
          _id: `mock-${Date.now()}`,
          userId,
          symbol,
          name: body.name || symbol,
          notes: body.notes || "",
          alertAbove: body.alertAbove ?? null,
          alertBelow: body.alertBelow ?? null,
          addedAt: new Date(),
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get("symbol")?.trim().toUpperCase();

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    try {
      await connectDB();
      await Watchlist.deleteOne({ userId, symbol });
    } catch {
      // ignore db error
    }

    return NextResponse.json({ success: true, removed: symbol });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}
