import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import AnalysisHistory from "@/models/AnalysisHistory";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

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
    return NextResponse.json({ success: true, history });
  } catch (error) {
    console.error("AnalysisHistory GET error:", error);
    return NextResponse.json({ error: "Failed to fetch analysis history" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const userId = await getUserIdFromCookie();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    await connectDB();
    const entry = await AnalysisHistory.create({
      userId,
      type: body.type || "single",
      symbols: body.symbols || [],
      scores: body.scores ?? null,
      filters: body.filters ?? null,
    });
    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("AnalysisHistory POST error:", error);
    return NextResponse.json({ error: "Failed to log analysis" }, { status: 500 });
  }
}
