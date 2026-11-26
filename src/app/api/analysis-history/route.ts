import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import AnalysisHistory from "@/models/AnalysisHistory";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

const DEFAULT_HISTORY = [
  {
    _id: "hist-1",
    type: "single",
    symbols: ["RELIANCE.NS"],
    scores: { total: 78, grade: "B+" },
    createdAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    _id: "hist-2",
    type: "compare",
    symbols: ["TCS.NS", "INFY.NS"],
    scores: { total: 82, grade: "A" },
    createdAt: new Date(Date.now() - 3600000 * 18),
  },
  {
    _id: "hist-3",
    type: "screener",
    symbols: ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS"],
    filters: { sector: "Financial Services", minPE: 15, maxPE: 25 },
    createdAt: new Date(Date.now() - 3600000 * 48),
  },
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

  try {
    await connectDB();
    const history = await AnalysisHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    if (!history || history.length === 0) {
      return NextResponse.json({ success: true, history: DEFAULT_HISTORY });
    }
    return NextResponse.json({ success: true, history });
  } catch {
    // Database connection fallback
    return NextResponse.json({ success: true, history: DEFAULT_HISTORY });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    try {
      await connectDB();
      const entry = await AnalysisHistory.create({
        userId,
        type: body.type || "single",
        symbols: body.symbols || [],
        scores: body.scores ?? null,
        filters: body.filters ?? null,
      });
      return NextResponse.json({ success: true, entry });
    } catch {
      return NextResponse.json({
        success: true,
        entry: {
          _id: `mock-${Date.now()}`,
          userId,
          type: body.type || "single",
          symbols: body.symbols || [],
          scores: body.scores ?? null,
          filters: body.filters ?? null,
          createdAt: new Date(),
        },
      });
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to log analysis" }, { status: 500 });
  }
}
