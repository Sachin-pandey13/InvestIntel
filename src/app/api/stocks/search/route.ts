import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q")?.trim();

  if (!query || query.length < 1) {
    return NextResponse.json({ results: [] });
  }

  try {
    const searchRes = await yahooFinance.search(query, { quotesCount: 15, newsCount: 0 });
    const quotes = (searchRes.quotes || []) as Array<{
      symbol?: string;
      shortname?: string;
      longname?: string;
      exchDisp?: string;
      exchange?: string;
      quoteType?: string;
    }>;

    const results = quotes
      .filter((q) => q.quoteType === "EQUITY" && q.symbol)
      .slice(0, 10)
      .map((q) => ({
        symbol: q.symbol!,
        name: q.shortname || q.longname || q.symbol!,
        exchange: q.exchDisp || q.exchange || "",
        type: q.quoteType || "EQUITY",
      }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Stock search error:", error);
    return NextResponse.json({ error: "Failed to search stocks", results: [] }, { status: 500 });
  }
}
