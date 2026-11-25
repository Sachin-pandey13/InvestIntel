"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

type IndexData = {
  symbol: string;
  label: string;
  price: number;
  changePercent: number;
  history: { date: string; close: number }[];
};

const INDEX_LABELS: Record<string, string> = {
  "^NSEI": "NIFTY 50",
  "^BSESN": "SENSEX",
  "^NSEBANK": "BANK NIFTY",
};

export default function MarketOverview() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/stocks/compare?symbols=^NSEI,^BSESN,^NSEBANK&range=1mo");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const ordered = ["^NSEI", "^BSESN", "^NSEBANK"]
            .map((sym) => {
              const found = json.data.find((d: any) => d.symbol === sym);
              if (!found) return null;
              return {
                symbol: sym,
                label: INDEX_LABELS[sym] || sym,
                price: found.price,
                changePercent: found.changePercent,
                history: (found.history || []).slice(-25),
              };
            })
            .filter(Boolean) as IndexData[];
          setIndices(ordered);
        }
      } catch (err) {
        console.error("Failed to fetch indices:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="glass p-5 rounded-2xl border border-white/[0.06]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#67e8f9]" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">Indian Market Indices</h2>
        </div>
        <Link
          href="/dashboard/market"
          className="text-xs font-medium text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1 transition-colors"
        >
          View Market <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-24 rounded-xl bg-white/[0.03] border border-white/[0.05] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {indices.map((idx, i) => {
            const up = idx.changePercent >= 0;
            const color = up ? "#34d399" : "#f87171";
            return (
              <motion.div
                key={idx.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="p-4 rounded-xl bg-white/[0.025] border border-white/[0.06] flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                    {idx.label}
                  </p>
                  <p className="text-lg font-bold text-[#f1f5f9] mt-0.5 tabular-nums">
                    {idx.price?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                  </p>
                  <div
                    className={`inline-flex items-center gap-1 text-xs font-semibold mt-1 ${
                      up ? "text-[#34d399]" : "text-[#f87171]"
                    }`}
                  >
                    {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    {up ? "+" : ""}
                    {idx.changePercent?.toFixed(2)}%
                  </div>
                </div>
                <div className="w-24 h-14">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={idx.history}>
                      <defs>
                        <linearGradient id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="close"
                        stroke={color}
                        strokeWidth={1.8}
                        fill={`url(#grad-${i})`}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
