import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectDB from "@/lib/db";
import StockCache from "@/models/StockCache";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const STOCK_UNIVERSE: Record<string, string[]> = {
  IT: ["TCS.NS", "INFY.NS", "WIPRO.NS", "HCLTECH.NS", "TECHM.NS", "LTIM.NS"],
  Banking: ["HDFCBANK.NS", "ICICIBANK.NS", "KOTAKBANK.NS", "SBIN.NS", "AXISBANK.NS", "INDUSINDBK.NS"],
  Auto: ["MARUTI.NS", "TATAMOTORS.NS", "M&M.NS", "BAJAJ-AUTO.NS", "HEROMOTOCO.NS"],
  Pharma: ["SUNPHARMA.NS", "DRREDDY.NS", "CIPLA.NS", "DIVISLAB.NS"],
  FMCG: ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "BRITANNIA.NS"],
  Energy: ["RELIANCE.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "ADANIENT.NS"],
  Metals: ["TATASTEEL.NS", "HINDALCO.NS", "JSWSTEEL.NS", "COALINDIA.NS"],
  Financials: ["BAJFINANCE.NS", "BAJAJFINSV.NS", "HDFCLIFE.NS", "SBILIFE.NS"],
};

const SYMBOL_SECTOR_MAP: Record<string, string> = {};
for (const [sector, syms] of Object.entries(STOCK_UNIVERSE)) {
  for (const sym of syms) {
    SYMBOL_SECTOR_MAP[sym] = sector;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sector = searchParams.get("sector") || "All";
  const minPE = searchParams.get("minPE") ? Number(searchParams.get("minPE")) : null;
  const maxPE = searchParams.get("maxPE") ? Number(searchParams.get("maxPE")) : null;
  const minDividend = searchParams.get("minDividend") ? Number(searchParams.get("minDividend")) : null;
  const capType = searchParams.get("capType") || "all";

  let targetSymbols: string[] = [];
  if (sector !== "All" && STOCK_UNIVERSE[sector]) {
    targetSymbols = STOCK_UNIVERSE[sector];
  } else {
    // Representative top 20 across all sectors when "All" is selected to keep latency fast
    targetSymbols = Object.values(STOCK_UNIVERSE).flatMap((list) => list.slice(0, 3));
  }

  try {
    await connectDB();
    const now = Date.now();

    const rawStocks = await Promise.all(
      targetSymbols.map(async (symbol) => {
        const cacheKey = `SCREENER_${symbol}`;
        const cached = await StockCache.findOne({ symbol: cacheKey });
        if (cached && now - new Date(cached.lastUpdated).getTime() < CACHE_TTL) {
          return cached.data;
        }

        try {
          const quote = (await yahooFinance.quote(symbol)) as Record<string, any>;
          const price = quote.regularMarketPrice ?? 0;
          const prevClose = quote.regularMarketPreviousClose ?? price;
          const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

          const item = {
            symbol,
            name: quote.shortName || quote.longName || symbol,
            price: Number(price.toFixed(2)),
            changePercent: Number(changePercent.toFixed(2)),
            pe: quote.trailingPE ? Number(quote.trailingPE.toFixed(2)) : null,
            marketCap: quote.marketCap ?? null,
            dividendYield: quote.trailingAnnualDividendYield
              ? Number((quote.trailingAnnualDividendYield * 100).toFixed(2))
              : 0,
            high52: quote.fiftyTwoWeekHigh ? Number(quote.fiftyTwoWeekHigh.toFixed(2)) : null,
            low52: quote.fiftyTwoWeekLow ? Number(quote.fiftyTwoWeekLow.toFixed(2)) : null,
            sector: SYMBOL_SECTOR_MAP[symbol] || quote.sector || "Equity",
          };

          await StockCache.findOneAndUpdate(
            { symbol: cacheKey },
            { data: item, source: "Yahoo Finance", lastUpdated: new Date() },
            { upsert: true, new: true }
          );

          return item;
        } catch {
          return cached ? cached.data : null;
        }
      })
    );

    const filtered = rawStocks
      .filter(Boolean)
      .filter((s: any) => {
        if (minPE !== null && (s.pe === null || s.pe < minPE)) return false;
        if (maxPE !== null && (s.pe === null || s.pe > maxPE)) return false;
        if (minDividend !== null && (s.dividendYield ?? 0) < minDividend) return false;
        if (capType !== "all" && s.marketCap) {
          const cr = s.marketCap / 1e7; // 1 Crore = 10^7 INR
          if (capType === "large" && cr < 50000) return false;
          if (capType === "mid" && (cr < 10000 || cr >= 50000)) return false;
          if (capType === "small" && cr >= 10000) return false;
        }
        return true;
      })
      .sort((a: any, b: any) => (b.marketCap ?? 0) - (a.marketCap ?? 0));

    return NextResponse.json({
      success: true,
      count: filtered.length,
      stocks: filtered,
    });
  } catch (error) {
    console.error("Screener API error:", error);
    return NextResponse.json({ error: "Failed to screen stocks" }, { status: 500 });
  }
}
