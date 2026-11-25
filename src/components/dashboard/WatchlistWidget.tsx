"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Plus, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";

type WatchItem = {
  _id: string;
  symbol: string;
  name: string;
  price: number | null;
  changePercent: number;
};

export default function WatchlistWidget() {
  const [items, setItems] = useState<WatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/watchlist");
        if (res.ok) {
          const json = await res.json();
          if (json.success) setItems((json.items || []).slice(0, 5));
        }
      } catch (err) {
        console.error("Watchlist widget error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="glass p-5 rounded-2xl border border-white/[0.06] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-[#fbbf24]" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">My Watchlist</h2>
        </div>
        <Link
          href="/dashboard/watchlist"
          className="text-xs font-medium text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1"
        >
          View All <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <Star className="w-8 h-8 text-[#475569] mb-2" />
          <p className="text-sm text-[#94a3b8] mb-3">No stocks in your watchlist yet.</p>
          <Link
            href="/dashboard/screener"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30 hover:bg-[#7c3aed]/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Explore Screener
          </Link>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {items.map((item, idx) => {
            const up = item.changePercent >= 0;
            return (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={`/dashboard/analyze?symbol=${encodeURIComponent(item.symbol)}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs font-bold text-[#f1f5f9] truncate">{item.symbol}</p>
                    <p className="text-[11px] text-[#64748b] truncate">{item.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#f1f5f9] tabular-nums">
                      {item.price !== null ? `₹${item.price.toLocaleString("en-IN")}` : "—"}
                    </p>
                    <p
                      className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${
                        up ? "text-[#34d399]" : "text-[#f87171]"
                      }`}
                    >
                      {up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {up ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
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
