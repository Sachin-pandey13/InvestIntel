"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, BarChart3, GitCompareArrows, Search, ArrowRight } from "lucide-react";
import Link from "next/link";

type HistoryItem = {
  _id: string;
  type: "single" | "comparison" | "screener";
  symbols: string[];
  createdAt: string;
};

export default function RecentAnalysis() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/analysis-history");
        if (res.ok) {
          const json = await res.json();
          if (json.success) setHistory((json.history || []).slice(0, 5));
        }
      } catch (err) {
        console.error("RecentAnalysis load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const getIcon = (type: HistoryItem["type"]) => {
    if (type === "comparison") return GitCompareArrows;
    if (type === "screener") return Search;
    return BarChart3;
  };

  const getLabel = (type: HistoryItem["type"]) => {
    if (type === "comparison") return "Stock Comparison";
    if (type === "screener") return "Screener Run";
    return "Single Stock Analysis";
  };

  const getHref = (item: HistoryItem) => {
    if (item.type === "comparison") return "/dashboard/compare";
    if (item.type === "screener") return "/dashboard/screener";
    const sym = item.symbols?.[0];
    return sym ? `/dashboard/analyze?symbol=${encodeURIComponent(sym)}` : "/dashboard/analyze";
  };

  return (
    <div className="glass p-5 rounded-2xl border border-white/[0.06] h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#60a5fa]" />
          <h2 className="text-sm font-semibold text-[#f1f5f9]">Recent Analysis</h2>
        </div>
        <Link
          href="/dashboard/analyze"
          className="text-xs font-medium text-[#a78bfa] hover:text-[#c4b5fd] flex items-center gap-1"
        >
          New Analysis <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2.5 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
          <BarChart3 className="w-8 h-8 text-[#475569] mb-2" />
          <p className="text-sm text-[#94a3b8] mb-3">
            No analyses recorded yet. Start by analyzing a stock!
          </p>
          <Link
            href="/dashboard/analyze?symbol=RELIANCE.NS"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-[#60a5fa]/15 text-[#60a5fa] border border-[#60a5fa]/30 hover:bg-[#60a5fa]/25 transition-colors"
          >
            Analyze RELIANCE.NS <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {history.map((item, idx) => {
            const Icon = getIcon(item.type);
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Link
                  href={getHref(item)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-[#60a5fa]/15 text-[#60a5fa] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#f1f5f9] truncate">
                        {item.symbols?.length ? item.symbols.join(" vs ") : getLabel(item.type)}
                      </p>
                      <p className="text-[11px] text-[#64748b]">{getLabel(item.type)}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#475569] shrink-0">
                    {new Date(item.createdAt).toLocaleDateString("en-IN", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
