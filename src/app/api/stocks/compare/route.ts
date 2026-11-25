import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import connectDB from "@/lib/db";
import StockCache from "@/models/StockCache";
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'] });
const CACHE_TTL = 0; // Temp bypass

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbolsParam = searchParams.get("symbols");
  const range = searchParams.get("range") || "3mo"; 
  
  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }
  
  let symbols = symbolsParam.split(",").map(s => s.trim().toUpperCase());
  if (!symbols.includes("^NSEI")) symbols.push("^NSEI");

  try {
    await connectDB();

    const allData = await Promise.all(symbols.map(async (symbol) => {
      // 1. Check MongoDB Cache first
      const cached = await StockCache.findOne({ symbol });
      const now = new Date().getTime();
      
      if (cached && (now - new Date(cached.lastUpdated).getTime()) < CACHE_TTL) {
        return { ...cached.data, source: cached.source, lastUpdated: cached.lastUpdated, isCached: true };
      }

      // 2. Primary Fetch: Yahoo Finance 2 (Native Crumb Bypass)
      let dataSource = "Yahoo Finance";
      try {
        const interval = ["1y", "5y"].includes(range) ? "1wk" : "1d";
        
        // Use yahooFinance to securely fetch without invalid crumb blocks
        const chartData = await yahooFinance.chart(symbol, {
          period1: range === "1mo" ? new Date(Date.now() - 30*24*60*60*1000) :
                   range === "3mo" ? new Date(Date.now() - 90*24*60*60*1000) :
                   range === "6mo" ? new Date(Date.now() - 180*24*60*60*1000) :
                   range === "1y" ? new Date(Date.now() - 365*24*60*60*1000) :
                   new Date(Date.now() - 5*365*24*60*60*1000),
          interval: interval as any
        });

        const quote = await yahooFinance.quote(symbol);

        const closes = chartData.quotes.map((q: any) => q.close).filter(Boolean);
        const timestamps = chartData.quotes.map((q: any) => q.date);

        const price = quote.regularMarketPrice || chartData.meta.regularMarketPrice;
        const prevClose = quote.regularMarketPreviousClose || chartData.meta.chartPreviousClose;
        const changePercent = prevClose ? ((price - prevClose) / prevClose) * 100 : 0;

        let sumReturns = 0, validDays = 0;
        const returns = [];
        for(let i=1; i<closes.length; i++) {
          if(closes[i] && closes[i-1]) {
            const ret = (closes[i] - closes[i-1]) / closes[i-1];
            returns.push(ret);
            sumReturns += ret;
            validDays++;
          }
        }
        const meanReturn = validDays > 0 ? sumReturns / validDays : 0;
        let variance = 0;
        returns.forEach(r => { variance += Math.pow(r - meanReturn, 2); });
        const volatility = validDays > 1 ? Math.sqrt(variance / (validDays - 1)) * Math.sqrt(252) : 0;

        const formattedData = {
          symbol,
          name: quote.shortName || symbol,
          price,
          changePercent,
          volatility: (volatility * 100).toFixed(2),
          fundamentals: {
            pe: quote.trailingPE ? quote.trailingPE.toFixed(2) : "N/A",
            marketCap: quote.marketCap || "N/A",
            eps: quote.epsTrailingTwelveMonths ? quote.epsTrailingTwelveMonths.toFixed(2) : "N/A",
            high52: quote.fiftyTwoWeekHigh ? quote.fiftyTwoWeekHigh.toFixed(2) : "N/A",
            low52: quote.fiftyTwoWeekLow ? quote.fiftyTwoWeekLow.toFixed(2) : "N/A",
            dividendYield: quote.trailingAnnualDividendYield ? (quote.trailingAnnualDividendYield * 100).toFixed(2) + "%" : "N/A",
            sector: quote.sector || "Data Not Available"
          },
          history: timestamps.map((ts: Date, i: number) => ({
            date: new Date(ts).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
            close: Number(closes[i]?.toFixed(2) || price)
          })).filter((d: any) => d.close && !isNaN(d.close))
        };

        // Save to MongoDB Cache
        await StockCache.findOneAndUpdate(
          { symbol },
          { data: formattedData, source: dataSource, lastUpdated: new Date() },
          { upsert: true, new: true }
        );

        return { ...formattedData, source: dataSource, lastUpdated: new Date(), isCached: false };

      } catch (primaryError) {
        // Final Fallback: Return stale Cache if APIs completely fail
        if (cached) {
          return { ...cached.data, source: cached.source + " (Stale Fallback)", lastUpdated: cached.lastUpdated, isCached: true };
        }
        return null; // Utter failure
      }
    }));

    return NextResponse.json({ success: true, data: allData.filter(Boolean) });
  } catch (error) {
    console.error("Multi-Provider API Error:", error);
    return NextResponse.json({ error: "Failed to fetch comparison data" }, { status: 500 });
  }
}
