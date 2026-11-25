import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectDB from "@/lib/db";
import StockCache from "@/models/StockCache";
import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  const cacheKey = `QUOTE_${symbol}`;

  try {
    await connectDB();
    const cached = await StockCache.findOne({ symbol: cacheKey });
    const now = Date.now();

    if (cached && now - new Date(cached.lastUpdated).getTime() < CACHE_TTL) {
      return NextResponse.json({ ...cached.data, isCached: true });
    }

    try {
      const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
      const [quote, chartData] = await Promise.all([
        yahooFinance.quote(symbol),
        yahooFinance.chart(symbol, { period1: sixMonthsAgo, interval: "1d" }),
      ]);

      const q = quote as Record<string, any>;
      const price = q.regularMarketPrice ?? chartData.meta.regularMarketPrice ?? 0;
      const previousClose = q.regularMarketPreviousClose ?? chartData.meta.chartPreviousClose ?? price;
      const change = price - previousClose;
      const changePercent = previousClose ? (change / previousClose) * 100 : 0;

      const history = (chartData.quotes || [])
        .filter((bar: any) => bar.close != null && !isNaN(bar.close))
        .map((bar: any) => ({
          date: new Date(bar.date).toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
          }),
          close: Number(bar.close.toFixed(2)),
          open: Number((bar.open ?? bar.close).toFixed(2)),
          high: Number((bar.high ?? bar.close).toFixed(2)),
          low: Number((bar.low ?? bar.close).toFixed(2)),
          volume: bar.volume ?? 0,
        }));

      const payload = {
        symbol,
        name: q.shortName || q.longName || symbol,
        price: Number(price.toFixed(2)),
        previousClose: Number(previousClose.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        dayHigh: q.regularMarketDayHigh ?? null,
        dayLow: q.regularMarketDayLow ?? null,
        volume: q.regularMarketVolume ?? null,
        avgVolume: q.averageDailyVolume3Month ?? q.averageDailyVolume10Day ?? null,
        marketCap: q.marketCap ?? null,
        pe: q.trailingPE ? Number(q.trailingPE.toFixed(2)) : null,
        forwardPE: q.forwardPE ? Number(q.forwardPE.toFixed(2)) : null,
        pb: q.priceToBook ? Number(q.priceToBook.toFixed(2)) : null,
        eps: q.epsTrailingTwelveMonths ? Number(q.epsTrailingTwelveMonths.toFixed(2)) : null,
        dividendYield: q.trailingAnnualDividendYield
          ? Number((q.trailingAnnualDividendYield * 100).toFixed(2))
          : null,
        high52: q.fiftyTwoWeekHigh ? Number(q.fiftyTwoWeekHigh.toFixed(2)) : null,
        low52: q.fiftyTwoWeekLow ? Number(q.fiftyTwoWeekLow.toFixed(2)) : null,
        sector: q.sector || "Equity",
        industry: q.industry || q.quoteType || "Market Equity",
        currency: q.currency || "INR",
        history,
      };

      await StockCache.findOneAndUpdate(
        { symbol: cacheKey },
        { data: payload, source: "Yahoo Finance", lastUpdated: new Date() },
        { upsert: true, new: true }
      );

      return NextResponse.json({ ...payload, isCached: false });
    } catch (apiError) {
      if (cached) {
        return NextResponse.json({ ...cached.data, isCached: true, stale: true });
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Stock quote error:", error);
    return NextResponse.json({ error: "Failed to fetch stock quote" }, { status: 500 });
  }
}
