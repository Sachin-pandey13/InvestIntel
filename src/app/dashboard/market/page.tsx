"use client";
import { useState, useEffect } from "react";
import { Globe, TrendingUp, TrendingDown, RefreshCw } from "lucide-react";
import MarketOverview from "@/components/dashboard/MarketOverview";
import Link from "next/link";

type StockRow = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector: string;
  pe: number | null;
};

export default function MarketPage() {
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMarket = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stocks/screener");
      const json = await res.json();
      if (json.success) setStocks(json.stocks || []);
    } catch (err) {
      console.error("Market load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarket();
  }, []);

  // Group by sector for sector performance summary
  const sectorMap: Record<string, { count: number; avgChange: number }> = {};
  stocks.forEach((s) => {
    if (!sectorMap[s.sector]) sectorMap[s.sector] = { count: 0, avgChange: 0 };
    sectorMap[s.sector].count += 1;
    sectorMap[s.sector].avgChange += s.changePercent;
  });

  const sectors = Object.entries(sectorMap)
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgChange: Number((data.avgChange / data.count).toFixed(2)),
    }))
    .sort((a, b) => b.avgChange - a.avgChange);

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-[#67e8f9]" />
            Market Overview &amp; Sector Heatmap
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Live NSE benchmark indices and sector-level average daily performance
          </p>
        </div>
        <button
          onClick={loadMarket}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-[#f1f5f9] border border-white/[0.06]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      <MarketOverview />

      {/* Sector Heatmap */}
      <div className="glass p-5 rounded-2xl border border-white/[0.06]">
        <h2 className="text-sm font-semibold text-[#f1f5f9] mb-4">Sector Performance Heatmap</h2>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white/[0.03] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sectors.map((sec) => {
              const up = sec.avgChange >= 0;
              return (
                <Link
                  key={sec.name}
                  href={`/dashboard/screener`}
                  className="p-4 rounded-xl border transition-transform hover:-translate-y-0.5"
                  style={{
                    background: up ? "rgba(52,211,153,0.08)" : "rgba(248,113,113,0.08)",
                    borderColor: up ? "rgba(52,211,153,0.22)" : "rgba(248,113,113,0.22)",
                  }}
                >
                  <p className="text-xs font-semibold text-[#f1f5f9]">{sec.name}</p>
                  <div
                    className={`flex items-center gap-1 text-lg font-extrabold mt-1 ${
                      up ? "text-[#34d399]" : "text-[#f87171]"
                    }`}
                  >
                    {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    {up ? "+" : ""}
                    {sec.avgChange}%
                  </div>
                  <p className="text-[11px] text-[#64748b] mt-0.5">{sec.count} tracked equities</p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
