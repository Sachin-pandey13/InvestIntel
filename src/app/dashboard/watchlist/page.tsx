"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Star, Trash2, Plus, TrendingUp, TrendingDown, Search, BarChart3, RefreshCw } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type WatchlistItem = {
  _id: string;
  symbol: string;
  name: string;
  notes: string;
  price: number | null;
  changePercent: number;
  high52: number | null;
  low52: number | null;
  pe: number | null;
};

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const loadWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const json = await res.json();
      if (json.success) setItems(json.items || []);
    } catch {
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(query.trim())}`);
        const json = await res.json();
        setSearchResults(json.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleAdd = async (symbol: string, name: string) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol, name }),
      });
      if (res.ok) {
        toast.success(`Added ${symbol}`);
        setQuery("");
        setSearchResults([]);
        loadWatchlist();
      }
    } catch {
      toast.error("Failed to add stock");
    }
  };

  const handleRemove = async (symbol: string) => {
    try {
      const res = await fetch("/api/watchlist", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol }),
      });
      if (res.ok) {
        toast.success(`Removed ${symbol}`);
        setItems((prev) => prev.filter((i) => i.symbol !== symbol));
      }
    } catch {
      toast.error("Failed to remove stock");
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2.5">
            <Star className="w-6 h-6 text-[#fbbf24]" />
            Personal Watchlist
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Track live quotes, 52-week ranges, and valuations for your selected equities
          </p>
        </div>
        <button
          onClick={loadWatchlist}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-[#f1f5f9] border border-white/[0.06]"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} /> Refresh Prices
        </button>
      </div>

      {/* Add Stock Search */}
      <div className="glass p-4 rounded-2xl border border-white/[0.06] relative">
        <div className="flex items-center gap-3">
          <Search className="w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stock to add to watchlist (e.g. RELIANCE, INFY, AAPL)..."
            className="w-full bg-transparent text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none"
          />
          {searching && <RefreshCw className="w-4 h-4 text-[#a78bfa] animate-spin" />}
        </div>

        {searchResults.length > 0 && (
          <div className="mt-3 rounded-xl bg-[#0f172a] border border-white/[0.08] divide-y divide-white/[0.05] max-h-64 overflow-y-auto">
            {searchResults.map((r) => (
              <div
                key={r.symbol}
                className="px-4 py-2.5 flex items-center justify-between hover:bg-white/[0.04]"
              >
                <div>
                  <p className="text-xs font-bold text-[#f1f5f9]">{r.symbol}</p>
                  <p className="text-[11px] text-[#64748b]">{r.name}</p>
                </div>
                <button
                  onClick={() => handleAdd(r.symbol, r.name)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-[#7c3aed]/20 text-[#a78bfa] hover:bg-[#7c3aed]/35"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-white/[0.03] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass p-12 rounded-2xl border border-white/[0.06] text-center">
          <Star className="w-10 h-10 text-[#475569] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#94a3b8]">Your watchlist is empty</p>
          <p className="text-xs text-[#64748b] mt-1 mb-4">
            Search above or discover stocks in the Screener
          </p>
          <Link
            href="/dashboard/screener"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#7c3aed] text-white"
          >
            Open Stock Screener
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, idx) => {
            const up = item.changePercent >= 0;
            return (
              <motion.div
                key={item.symbol}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="glass p-5 rounded-2xl border border-white/[0.06] flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base font-bold text-[#f1f5f9] truncate">{item.symbol}</h3>
                    <p className="text-xs text-[#64748b] truncate">{item.name}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(item.symbol)}
                    title="Remove from watchlist"
                    className="p-1.5 rounded-lg text-[#64748b] hover:text-[#f87171] hover:bg-[#f87171]/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-extrabold text-[#f1f5f9] tabular-nums">
                      {item.price !== null ? `₹${item.price.toLocaleString("en-IN")}` : "—"}
                    </p>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold ${
                        up ? "text-[#34d399]" : "text-[#f87171]"
                      }`}
                    >
                      {up ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {up ? "+" : ""}
                      {item.changePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-[#64748b] space-y-0.5">
                    <p>P/E: {item.pe ?? "N/A"}</p>
                    <p>
                      52W: {item.low52 ?? "—"} – {item.high52 ?? "—"}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/dashboard/analyze?symbol=${encodeURIComponent(item.symbol)}`}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-center bg-white/[0.04] hover:bg-[#7c3aed]/20 text-[#a78bfa] border border-white/[0.06] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" /> Deep Analysis
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
