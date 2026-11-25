"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  Search,
  Star,
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  DollarSign,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { calculateCompositeScore } from "@/lib/scoring";
import toast from "react-hot-toast";
import Link from "next/link";

const RANGES = [
  { label: "1M", value: "1mo" },
  { label: "3M", value: "3mo" },
  { label: "6M", value: "6mo" },
  { label: "1Y", value: "1y" },
  { label: "5Y", value: "5y" },
];

const POPULAR_STOCKS = [
  { symbol: "RELIANCE.NS", name: "Reliance Industries" },
  { symbol: "TCS.NS", name: "Tata Consultancy Services" },
  { symbol: "HDFCBANK.NS", name: "HDFC Bank" },
  { symbol: "INFY.NS", name: "Infosys" },
  { symbol: "ITC.NS", name: "ITC Ltd" },
  { symbol: "TATAMOTORS.NS", name: "Tata Motors" },
];

export default function AnalyzePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1440px] mx-auto py-12 text-center text-[#64748b]">
          Loading Stock Analyzer...
        </div>
      }
    >
      <AnalyzeContent />
    </Suspense>
  );
}

function AnalyzeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const symbol = searchParams.get("symbol")?.trim().toUpperCase() || "";

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const [range, setRange] = useState("6mo");
  const [activeTab, setActiveTab] = useState<"chart" | "fundamentals" | "score">("chart");
  const [showSma20, setShowSma20] = useState(true);
  const [showSma50, setShowSma50] = useState(true);
  const [showBB, setShowBB] = useState(false);

  const [quote, setQuote] = useState<any>(null);
  const [tech, setTech] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [addingWatchlist, setAddingWatchlist] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const json = await res.json();
        setSearchResults(json.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadStock = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    try {
      const [qRes, tRes] = await Promise.all([
        fetch(`/api/stocks/quote?symbol=${encodeURIComponent(symbol)}`),
        fetch(`/api/stocks/technical?symbol=${encodeURIComponent(symbol)}&range=${range}`),
      ]);
      const qJson = await qRes.json();
      const tJson = await tRes.json();
      if (qRes.ok) setQuote(qJson);
      if (tRes.ok) setTech(tJson);

      // Record in analysis history (fire & forget)
      if (qRes.ok) {
        fetch("/api/analysis-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "single", symbols: [symbol] }),
        }).catch(() => {});
      }
    } catch (err) {
      console.error("Analyze load error:", err);
      toast.error("Failed to load stock data");
    } finally {
      setLoading(false);
    }
  }, [symbol, range]);

  useEffect(() => {
    loadStock();
  }, [loadStock]);

  const handleAddWatchlist = async () => {
    if (!quote) return;
    setAddingWatchlist(true);
    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbol: quote.symbol, name: quote.name }),
      });
      if (res.ok) {
        toast.success(`${quote.symbol} added to watchlist`);
      } else {
        toast.error("Could not add to watchlist");
      }
    } catch {
      toast.error("Error updating watchlist");
    } finally {
      setAddingWatchlist(false);
    }
  };

  // Search view when no symbol is selected
  if (!symbol) {
    return (
      <div className="max-w-3xl mx-auto py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#f1f5f9] tracking-tight">
            Single Stock Deep Analysis
          </h1>
          <p className="text-sm text-[#64748b]">
            Search any NSE/BSE/Global stock to inspect technical indicators, fundamentals, and your personalized fit score
          </p>
        </div>

        <div className="relative">
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-[#0f172a] border border-white/[0.1] focus-within:border-[#a78bfa]">
            <Search className="w-5 h-5 text-[#64748b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by symbol or company name (e.g. RELIANCE, TCS, INFY)..."
              className="w-full bg-transparent text-sm text-[#f1f5f9] placeholder:text-[#475569] focus:outline-none"
            />
            {searching && <RefreshCw className="w-4 h-4 text-[#a78bfa] animate-spin" />}
          </div>

          {searchResults.length > 0 && (
            <div className="mt-2 rounded-2xl bg-[#0f172a] border border-white/[0.08] overflow-hidden divide-y divide-white/[0.05]">
              {searchResults.map((r) => (
                <button
                  key={r.symbol}
                  onClick={() => router.push(`/dashboard/analyze?symbol=${encodeURIComponent(r.symbol)}`)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/[0.04] text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-[#f1f5f9]">{r.symbol}</p>
                    <p className="text-xs text-[#64748b]">{r.name}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-white/[0.05] text-[#94a3b8]">
                    {r.exchange}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748b] mb-3">
            Popular NSE Stocks
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {POPULAR_STOCKS.map((s) => (
              <Link
                key={s.symbol}
                href={`/dashboard/analyze?symbol=${encodeURIComponent(s.symbol)}`}
                className="glass p-4 rounded-xl border border-white/[0.06] hover:border-[#a78bfa]/40 transition-colors"
              >
                <p className="text-sm font-bold text-[#f1f5f9]">{s.symbol}</p>
                <p className="text-xs text-[#64748b] truncate mt-0.5">{s.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Compute composite score when both quote & tech are loaded
  const compositeScore =
    quote && tech
      ? calculateCompositeScore(
          {
            price: quote.price,
            changePercent: quote.changePercent,
            volatility: tech.volatility ?? 20,
            pe: quote.pe,
            eps: quote.eps,
            dividendYield: quote.dividendYield,
            marketCap: quote.marketCap,
            high52: quote.high52,
            low52: quote.low52,
            sector: quote.sector || "Equity",
            rsiValue: tech.signal?.rsiLatest ?? null,
            macdSignal: tech.signal?.macdBias ?? "neutral",
            priceVsSma200: tech.signal?.sma200Position ?? "na",
          },
          {
            riskAppetite: (user?.riskAppetite as "Low" | "Moderate" | "High") || "Moderate",
            preferredInvestmentType: user?.preferredInvestmentType || [],
            financialGoals: user?.financialGoals || [],
            timeHorizon: (user?.timeHorizon as "Short-term" | "Mid-term" | "Long-term") || "Long-term",
            monthlyBudget: Math.max(0, (user?.income || 0) - (user?.expenses || 0) - (user?.emi || 0)),
          }
        )
      : null;

  const up = (quote?.changePercent ?? 0) >= 0;

  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      {/* Top Search & Quick Switch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          href="/dashboard/analyze"
          className="text-xs font-medium text-[#a78bfa] hover:underline inline-flex items-center gap-1"
        >
          <Search className="w-3.5 h-3.5" /> Search another stock
        </Link>
        <div className="flex items-center gap-1.5">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                range === r.value
                  ? "bg-[#7c3aed] text-white"
                  : "bg-white/[0.04] text-[#94a3b8] hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading && !quote ? (
        <div className="glass p-12 rounded-2xl border border-white/[0.06] text-center text-[#64748b]">
          <RefreshCw className="w-7 h-7 animate-spin mx-auto mb-3 text-[#a78bfa]" />
          Loading live market &amp; technical data for {symbol}...
        </div>
      ) : quote ? (
        <>
          {/* Stock Header */}
          <div className="glass p-6 rounded-2xl border border-white/[0.06] flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-[#f1f5f9]">{quote.symbol}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#94a3b8]">
                  {quote.sector}
                </span>
                {tech?.signal?.signal && (
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      tech.signal.signal === "BUY"
                        ? "bg-[#34d399]/15 text-[#34d399]"
                        : tech.signal.signal === "SELL"
                        ? "bg-[#f87171]/15 text-[#f87171]"
                        : "bg-[#fbbf24]/15 text-[#fbbf24]"
                    }`}
                  >
                    Signal: {tech.signal.signal}
                  </span>
                )}
              </div>
              <p className="text-sm text-[#94a3b8] mt-1">{quote.name}</p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <div>
                <p className="text-3xl font-extrabold text-[#f1f5f9] tabular-nums">
                  ₹{quote.price?.toLocaleString("en-IN")}
                </p>
                <p
                  className={`inline-flex items-center gap-1 text-sm font-semibold mt-0.5 ${
                    up ? "text-[#34d399]" : "text-[#f87171]"
                  }`}
                >
                  {up ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {up ? "+" : ""}
                  {quote.change} ({up ? "+" : ""}
                  {quote.changePercent}%)
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={handleAddWatchlist}
                  disabled={addingWatchlist}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[#fbbf24]/15 text-[#fbbf24] border border-[#fbbf24]/25 hover:bg-[#fbbf24]/25 transition-colors"
                >
                  <Star className="w-4 h-4" /> Add to Watchlist
                </button>
                <Link
                  href="/dashboard/compare"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/[0.05] text-[#f1f5f9] border border-white/[0.08] hover:bg-white/[0.1] transition-colors"
                >
                  <GitCompareArrows className="w-4 h-4 text-[#67e8f9]" /> Compare
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-white/[0.06] pb-3">
            {[
              { id: "chart", label: "Technical Charts", icon: Activity },
              { id: "fundamentals", label: "Fundamentals", icon: DollarSign },
              { id: "score", label: "Composite Score", icon: ShieldCheck },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  activeTab === t.id
                    ? "bg-[#7c3aed]/20 text-[#a78bfa] border border-[#7c3aed]/30"
                    : "text-[#64748b] hover:text-[#f1f5f9]"
                }`}
              >
                <t.icon className="w-4 h-4" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab 1: Technical Charts */}
          {activeTab === "chart" && tech && (
            <div className="space-y-5">
              {/* Price + Overlays */}
              <div className="glass p-5 rounded-2xl border border-white/[0.06]">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h2 className="text-sm font-semibold text-[#f1f5f9]">
                    Price &amp; Moving Averages ({range.toUpperCase()})
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <button
                      onClick={() => setShowSma20((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg border ${
                        showSma20
                          ? "bg-[#67e8f9]/15 border-[#67e8f9]/40 text-[#67e8f9]"
                          : "border-white/[0.08] text-[#64748b]"
                      }`}
                    >
                      SMA 20
                    </button>
                    <button
                      onClick={() => setShowSma50((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg border ${
                        showSma50
                          ? "bg-[#fbbf24]/15 border-[#fbbf24]/40 text-[#fbbf24]"
                          : "border-white/[0.08] text-[#64748b]"
                      }`}
                    >
                      SMA 50
                    </button>
                    <button
                      onClick={() => setShowBB((v) => !v)}
                      className={`px-2.5 py-1 rounded-lg border ${
                        showBB
                          ? "bg-[#34d399]/15 border-[#34d399]/40 text-[#34d399]"
                          : "border-white/[0.08] text-[#64748b]"
                      }`}
                    >
                      Bollinger Bands
                    </button>
                  </div>
                </div>

                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tech.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="date" stroke="#475569" fontSize={11} />
                      <YAxis domain={["auto", "auto"]} stroke="#475569" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          background: "#0f172a",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="close"
                        name="Close"
                        stroke="#a78bfa"
                        strokeWidth={2}
                        dot={false}
                      />
                      {showSma20 && (
                        <Line
                          type="monotone"
                          dataKey="sma20"
                          name="SMA 20"
                          stroke="#67e8f9"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}
                      {showSma50 && (
                        <Line
                          type="monotone"
                          dataKey="sma50"
                          name="SMA 50"
                          stroke="#fbbf24"
                          strokeWidth={1.5}
                          dot={false}
                        />
                      )}
                      {showBB && (
                        <>
                          <Line
                            type="monotone"
                            dataKey="bbUpper"
                            name="BB Upper"
                            stroke="#34d399"
                            strokeDasharray="4 4"
                            strokeWidth={1}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="bbLower"
                            name="BB Lower"
                            stroke="#34d399"
                            strokeDasharray="4 4"
                            strokeWidth={1}
                            dot={false}
                          />
                        </>
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RSI & MACD Side by Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="glass p-5 rounded-2xl border border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">
                    RSI (14) — Momentum Oscillator
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={tech.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                        <YAxis domain={[0, 100]} stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <ReferenceLine y={70} stroke="#f87171" strokeDasharray="3 3" />
                        <ReferenceLine y={30} stroke="#34d399" strokeDasharray="3 3" />
                        <Line
                          type="monotone"
                          dataKey="rsi14"
                          name="RSI(14)"
                          stroke="#67e8f9"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="glass p-5 rounded-2xl border border-white/[0.06]">
                  <h3 className="text-sm font-semibold text-[#f1f5f9] mb-3">
                    MACD (12, 26, 9) — Trend &amp; Crossovers
                  </h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={tech.history}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="date" stroke="#475569" fontSize={10} />
                        <YAxis stroke="#475569" fontSize={10} />
                        <Tooltip
                          contentStyle={{
                            background: "#0f172a",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        />
                        <Bar dataKey="macdHist" name="Histogram" fill="#7c3aed" />
                        <Line
                          type="monotone"
                          dataKey="macd"
                          name="MACD"
                          stroke="#67e8f9"
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="macdSignal"
                          name="Signal"
                          stroke="#fbbf24"
                          dot={false}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Fundamentals */}
          {activeTab === "fundamentals" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                { label: "P/E Ratio (TTM)", value: quote.pe ?? "N/A", note: "Trailing price-to-earnings" },
                { label: "Forward P/E", value: quote.forwardPE ?? "N/A", note: "Estimated forward valuation" },
                { label: "Price / Book", value: quote.pb ?? "N/A", note: "Book value multiple" },
                { label: "EPS (TTM)", value: quote.eps ? `₹${quote.eps}` : "N/A", note: "Earnings per share" },
                {
                  label: "Dividend Yield",
                  value: quote.dividendYield ? `${quote.dividendYield}%` : "0%",
                  note: "Annual dividend yield",
                },
                {
                  label: "Market Cap",
                  value: quote.marketCap ? `₹${Math.round(quote.marketCap / 1e7).toLocaleString("en-IN")} Cr` : "N/A",
                  note: "Total market valuation",
                },
                { label: "52-Week High", value: quote.high52 ? `₹${quote.high52}` : "N/A", note: "1Y peak price" },
                { label: "52-Week Low", value: quote.low52 ? `₹${quote.low52}` : "N/A", note: "1Y trough price" },
                {
                  label: "Day Range",
                  value:
                    quote.dayLow && quote.dayHigh ? `₹${quote.dayLow} – ₹${quote.dayHigh}` : "N/A",
                  note: "Intraday low to high",
                },
                {
                  label: "Annualized Volatility",
                  value: tech?.volatility ? `${tech.volatility}%` : "N/A",
                  note: "StdDev(returns) × √252",
                },
              ].map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="glass p-4 rounded-2xl border border-white/[0.06]"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748b]">
                    {m.label}
                  </p>
                  <p className="text-xl font-bold text-[#f1f5f9] mt-1.5 tabular-nums">{m.value}</p>
                  <p className="text-[11px] text-[#475569] mt-1">{m.note}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tab 3: Composite Score */}
          {activeTab === "score" && compositeScore && (
            <div className="space-y-5">
              <div className="glass p-6 rounded-2xl border border-white/[0.06] flex flex-col md:flex-row items-center gap-8">
                <div className="w-36 h-36 rounded-full border-4 border-[#a78bfa] bg-[#7c3aed]/10 flex flex-col items-center justify-center shrink-0">
                  <span className="text-4xl font-extrabold text-white">
                    {compositeScore.totalScore}
                  </span>
                  <span className="text-xs text-[#a78bfa] font-semibold">
                    / 100 • Grade {compositeScore.grade}
                  </span>
                </div>
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#a78bfa]">
                      Personalized Quantitative Score
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#94a3b8]">
                      Profile: {user?.riskAppetite || "Moderate"} Risk
                    </span>
                  </div>
                  <p className="text-sm text-[#f1f5f9] leading-relaxed">
                    {compositeScore.recommendation}
                  </p>
                  {tech?.signal?.reasons?.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {tech.signal.reasons.map((r: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-white/[0.04] text-[#94a3b8] border border-white/[0.05]"
                        >
                          • {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { title: "Technical Score", max: 40, data: compositeScore.technical, color: "#67e8f9" },
                  { title: "Fundamental Score", max: 35, data: compositeScore.fundamental, color: "#34d399" },
                  { title: "Profile Fit Score", max: 25, data: compositeScore.profileFit, color: "#a78bfa" },
                ].map((cat) => (
                  <div key={cat.title} className="glass p-5 rounded-2xl border border-white/[0.06] space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-[#f1f5f9]">{cat.title}</h3>
                      <span className="text-sm font-bold" style={{ color: cat.color }}>
                        {cat.data.score} / {cat.max}
                      </span>
                    </div>
                    <div className="space-y-3">
                      {cat.data.details.map((d) => (
                        <div key={d.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#94a3b8]">{d.label}</span>
                            <span className="text-[#f1f5f9] font-semibold">
                              {d.score}/{d.maxScore}
                            </span>
                          </div>
                          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(d.score / d.maxScore) * 100}%`,
                                background: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
