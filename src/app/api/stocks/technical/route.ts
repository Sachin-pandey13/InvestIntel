import { NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import YahooFinance from "yahoo-finance2";
import {
  sma,
  ema,
  rsi,
  macd,
  bollingerBands,
  calculateVolatility,
  generateSignals,
} from "@/lib/indicators";

const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const RANGE_DAYS: Record<string, number> = {
  "1mo": 30,
  "3mo": 90,
  "6mo": 180,
  "1y": 365,
  "5y": 365 * 5,
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol")?.trim().toUpperCase();
  const range = searchParams.get("range") || "6mo";

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  try {
    const days = RANGE_DAYS[range] ?? 180;
    // Fetch at least 1 year for SMA200 calculation if range is shorter, then slice for display
    const fetchDays = Math.max(days, 365);
    const period1 = new Date(Date.now() - fetchDays * 24 * 60 * 60 * 1000);
    const interval = range === "5y" ? "1wk" : "1d";

    const chartData = await yahooFinance.chart(symbol, {
      period1,
      interval: interval as "1d" | "1wk",
    });

    const validBars = (chartData.quotes || []).filter(
      (q: any) => q.close != null && !isNaN(q.close)
    );

    const allCloses: number[] = validBars.map((q: any) => Number(q.close.toFixed(2)));
    const sma20All = sma(allCloses, 20);
    const sma50All = sma(allCloses, 50);
    const sma200All = sma(allCloses, 200);
    const ema12All = ema(allCloses, 12);
    const ema26All = ema(allCloses, 26);
    const rsi14All = rsi(allCloses, 14);
    const macdAll = macd(allCloses);
    const bbAll = bollingerBands(allCloses, 20, 2);
    const volatility = calculateVolatility(allCloses);
    const signal = generateSignals(allCloses);

    // Slice to requested display range
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    let startIdx = validBars.findIndex((b: any) => new Date(b.date).getTime() >= cutoffTime);
    if (startIdx === -1) startIdx = 0;

    const history = validBars.slice(startIdx).map((b: any, i: number) => {
      const idx = startIdx + i;
      return {
        date: new Date(b.date).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          ...(range === "5y" ? { year: "2-digit" } : {}),
        }),
        close: allCloses[idx],
        open: Number((b.open ?? b.close).toFixed(2)),
        high: Number((b.high ?? b.close).toFixed(2)),
        low: Number((b.low ?? b.close).toFixed(2)),
        volume: b.volume ?? 0,
        sma20: sma20All[idx],
        sma50: sma50All[idx],
        sma200: sma200All[idx],
        rsi14: rsi14All[idx],
        macd: macdAll.macdLine[idx],
        macdSignal: macdAll.signalLine[idx],
        macdHist: macdAll.histogram[idx],
        bbUpper: bbAll.upper[idx],
        bbMiddle: bbAll.middle[idx],
        bbLower: bbAll.lower[idx],
      };
    });

    return NextResponse.json({
      symbol,
      range,
      volatility,
      indicators: {
        sma20: sma20All.slice(startIdx),
        sma50: sma50All.slice(startIdx),
        sma200: sma200All.slice(startIdx),
        ema12: ema12All.slice(startIdx),
        ema26: ema26All.slice(startIdx),
        rsi14: rsi14All.slice(startIdx),
        macd: {
          macdLine: macdAll.macdLine.slice(startIdx),
          signalLine: macdAll.signalLine.slice(startIdx),
          histogram: macdAll.histogram.slice(startIdx),
        },
        bollingerBands: {
          upper: bbAll.upper.slice(startIdx),
          middle: bbAll.middle.slice(startIdx),
          lower: bbAll.lower.slice(startIdx),
        },
      },
      signal,
      history,
    });
  } catch (error) {
    console.error("Technical analysis error:", error);
    return NextResponse.json({ error: "Failed to calculate technical indicators" }, { status: 500 });
  }
}
