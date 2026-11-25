import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol") || "^NSEI"; 
  
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=14d&interval=1d`);
    if (!res.ok) throw new Error("Failed to fetch from Yahoo API");
    
    const json = await res.json();
    const result = json.chart.result[0];
    const meta = result.meta;
    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;

    const chartData = timestamps.map((ts: number, i: number) => ({
      t: new Date(ts * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      v: Number(closes[i]?.toFixed(2) || meta.regularMarketPrice)
    })).filter((d: any) => d.v && !isNaN(d.v));

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose;
    const change = price - prevClose;
    const changePercent = (change / prevClose) * 100;

    return NextResponse.json({
      success: true,
      data: {
        symbol: meta.symbol,
        name: meta.shortName || meta.symbol,
        price,
        change,
        changePercent,
        chart: chartData
      }
    });
  } catch (error) {
    console.error("Yahoo Finance Direct API Error:", error);
    return NextResponse.json({ error: "Failed to fetch market data" }, { status: 500 });
  }
}
