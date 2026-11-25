"use client";
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  X,
  Download,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

type ScreenerStock = {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
  pe: number | null;
  marketCap: number | null;
  dividendYield: number;
  high52: number | null;
  low52: number | null;
  sector: string;
};

const SECTORS = ["All", "IT", "Banking", "Auto", "Pharma", "FMCG", "Energy", "Metals", "Financials"];
const CAP_TYPES = [
  { label: "All Caps", value: "all" },
  { label: "Large Cap (>₹50k Cr)", value: "large" },
  { label: "Mid Cap (₹10k–50k Cr)", value: "mid" },
  { label: "Small Cap (<₹10k Cr)", value: "small" },
];

type SortKey = "symbol" | "price" | "changePercent" | "pe" | "marketCap" | "dividendYield";

function formatMarketCap(cap: number | null) {
  if (!cap) return "N/A";
  const cr = cap / 1e7;
  if (cr >= 100000) return `₹${(cr / 100000).toFixed(2)}L Cr`;
  return `₹${Math.round(cr).toLocaleString("en-IN")} Cr`;
}

export default function ScreenerPage() {
  const [sector, setSector] = useState("All");
  const [capType, setCapType] = useState("all");
  const [minPE, setMinPE] = useState("");
  const [maxPE, setMaxPE] = useState("");
  const [minDividend, setMinDividend] = useState("");
  const [stocks, setStocks] = useState<ScreenerStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("marketCap");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (sector !== "All") params.set("sector", sector);
      if (capType !== "all") params.set("capType", capType);
      if (minPE) params.set("minPE", minPE);
      if (maxPE) params.set("maxPE", maxPE);
      if (minDividend) params.set("minDividend", minDividend);

      const res = await fetch(`/api/stocks/screener?${params.toString()}`);
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to fetch screener data");
      }
      setStocks(json.stocks || []);
    } catch (err: any) {
      setError(err.message || "Error loading stocks");
    } finally {
      setLoading(false);
    }
  }, [sector, capType, minPE, maxPE, minDividend]);

  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  const handleReset = () => {
    setSector("All");
    setCapType("all");
    setMinPE("");
    setMaxPE("");
    setMinDividend("");
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sortedStocks = [...stocks].sort((a, b) => {
    const valA = a[sortKey] ?? -Infinity;
    const valB = b[sortKey] ?? -Infinity;
    if (typeof valA === "string" && typeof valB === "string") {
      return sortDir === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    return sortDir === "asc" ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
  });

  const exportCsv = () => {
    const headers = ["Symbol", "Name", "Sector", "Price", "Change%", "PE", "MarketCap_INR", "DividendYield%"];
    const rows = sortedStocks.map((s) => [
      s.symbol,
      `"${s.name.replace(/"/g, '""')}"`,
      s.sector,
      s.price,
      s.changePercent,
      s.pe ?? "",
      s.marketCap ?? "",
      s.dividendYield,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `investintel-screener-${sector.toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-[#475569]" />;
    return sortDir === "asc" ? (
      <ArrowUp className="w-3.5 h-3.5 text-[#a78bfa]" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-[#a78bfa]" />
    );
  };

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2.5">
            <Search className="w-6 h-6 text-[#a78bfa]" />
            Stock Screener
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Filter NSE equities by valuation, market cap, dividend yield, and sector
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            disabled={sortedStocks.length === 0}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-[#f1f5f9] border border-white/[0.06] transition-colors disabled:opacity-40"
          >
            <Download className="w-4 h-4 text-[#67e8f9]" />
            Export CSV
          </button>
          <button
            onClick={fetchStocks}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/[0.04] hover:bg-white/[0.08] text-[#f1f5f9] border border-white/[0.06] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass p-5 rounded-2xl border border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-4">
          <Filter className="w-3.5 h-3.5 text-[#a78bfa]" /> Screener Filters
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end">
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            >
              {SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Market Cap</label>
            <select
              value={capType}
              onChange={(e) => setCapType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            >
              {CAP_TYPES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Min P/E</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={minPE}
              onChange={(e) => setMinPE(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Max P/E</label>
            <input
              type="number"
              placeholder="e.g. 35"
              value={maxPE}
              onChange={(e) => setMaxPE(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Min Dividend %</label>
            <input
              type="number"
              step="0.1"
              placeholder="e.g. 1.0"
              value={minDividend}
              onChange={(e) => setMinDividend(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStocks}
              className="flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 transition-opacity"
            >
              Apply
            </button>
            <button
              onClick={handleReset}
              title="Reset Filters"
              className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#94a3b8] border border-white/[0.06]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-[#64748b]">
        <span>
          Showing <strong className="text-[#f1f5f9]">{sortedStocks.length}</strong> matching stocks
        </span>
        <span>Click any row to open deep technical &amp; fundamental analysis</span>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-[#f87171]/10 border border-[#f87171]/25 text-sm text-[#f87171] flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchStocks}
            className="px-3 py-1 rounded-lg bg-[#f87171]/20 text-xs font-semibold"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results Table */}
      <div className="glass rounded-2xl border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02] text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                <th className="py-3.5 px-4 cursor-pointer" onClick={() => handleSort("symbol")}>
                  <span className="inline-flex items-center gap-1.5">
                    Symbol <SortIcon col="symbol" />
                  </span>
                </th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Sector</th>
                <th className="py-3.5 px-4 cursor-pointer text-right" onClick={() => handleSort("price")}>
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Price <SortIcon col="price" />
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer text-right"
                  onClick={() => handleSort("changePercent")}
                >
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Change <SortIcon col="changePercent" />
                  </span>
                </th>
                <th className="py-3.5 px-4 cursor-pointer text-right" onClick={() => handleSort("pe")}>
                  <span className="inline-flex items-center justify-end gap-1.5">
                    P/E <SortIcon col="pe" />
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer text-right"
                  onClick={() => handleSort("marketCap")}
                >
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Market Cap <SortIcon col="marketCap" />
                  </span>
                </th>
                <th
                  className="py-3.5 px-4 cursor-pointer text-right"
                  onClick={() => handleSort("dividendYield")}
                >
                  <span className="inline-flex items-center justify-end gap-1.5">
                    Div Yield <SortIcon col="dividendYield" />
                  </span>
                </th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04] text-sm">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={9} className="p-4">
                      <div className="h-6 rounded bg-white/[0.03] animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : sortedStocks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-[#64748b]">
                    <BarChart3 className="w-10 h-10 mx-auto mb-3 text-[#334155]" />
                    <p className="text-sm font-medium text-[#94a3b8]">No stocks match your filters</p>
                    <button
                      onClick={handleReset}
                      className="mt-3 text-xs font-semibold text-[#a78bfa] hover:underline"
                    >
                      Reset all filters
                    </button>
                  </td>
                </tr>
              ) : (
                sortedStocks.map((s, idx) => {
                  const up = s.changePercent >= 0;
                  return (
                    <motion.tr
                      key={s.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#f1f5f9]">{s.symbol}</td>
                      <td className="py-3.5 px-4 text-[#94a3b8] max-w-[200px] truncate">{s.name}</td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/[0.05] text-[#cbd5e1]">
                          {s.sector}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-[#f1f5f9] tabular-nums">
                        ₹{s.price.toLocaleString("en-IN")}
                      </td>
                      <td
                        className={`py-3.5 px-4 text-right font-semibold tabular-nums ${
                          up ? "text-[#34d399]" : "text-[#f87171]"
                        }`}
                      >
                        {up ? "+" : ""}
                        {s.changePercent.toFixed(2)}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#cbd5e1] tabular-nums">
                        {s.pe !== null ? s.pe.toFixed(1) : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#cbd5e1] tabular-nums">
                        {formatMarketCap(s.marketCap)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-[#cbd5e1] tabular-nums">
                        {s.dividendYield ? `${s.dividendYield.toFixed(2)}%` : "—"}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/dashboard/analyze?symbol=${encodeURIComponent(s.symbol)}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#7c3aed]/15 text-[#a78bfa] hover:bg-[#7c3aed]/30 transition-colors"
                        >
                          Analyze
                        </Link>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
