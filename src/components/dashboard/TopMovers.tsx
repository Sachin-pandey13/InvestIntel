"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Flame } from "lucide-react";
import Link from "next/link";

type MoverStock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  sector: string;
};

export default function TopMovers() {
  const [tab, setTab] = useState<"gainers" | "losers">("gainers");
  const [stocks, setStocks] = useState<MoverStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stocks/screener");
        const json = await res.json();
        if (json.success && Array.isArray(json.stocks)) {
          setStocks(json.stocks);
        }
      } catch (err) {
        console.error("TopMovers fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayed = [...stocks]
    .sort((a, b) =>
      tab === "gainers" ? b.changePercent - a.changePercent : a.changePercent - b.changePercent
    )
    .slice(0, 5);

  return (
    <div className="glass p-5 rounded-2xl border border-white/[0.06] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#f87171]" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">Top Movers (NSE)</h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.05]">
          <button
            onClick={() => setTab("gainers")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === "gainers"
                ? "bg-[#34d399]/20 text-[#34d399]"
                : "text-[#64748b] hover:text-[#f1f5f9]"
            }`}
          >
            Gainers
          </button>
          <button
            onClick={() => setTab("losers")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              tab === "losers"
                ? "bg-[#f87171]/20 text-[#f87171]"
                : "text-[#64748b] hover:text-[#f1f5f9]"
            }`}
          >
            Losers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {displayed.map((stock, idx) => {
            const up = stock.changePercent >= 0;
            return (
              <motion.div
                key={`${tab}-${stock.symbol}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link
                  href={`/dashboard/analyze?symbol=${encodeURIComponent(stock.symbol)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#f1f5f9]">{stock.symbol}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.05] text-[#94a3b8]">
                        {stock.sector}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748b] truncate mt-0.5">{stock.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#f1f5f9] tabular-nums">
                      ₹{stock.price.toLocaleString("en-IN")}
                    </p>
                    <p
                      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                        up ? "text-[#34d399]" : "text-[#f87171]"
                      }`}
                    >
                      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {up ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
