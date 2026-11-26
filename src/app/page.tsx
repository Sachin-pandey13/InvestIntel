"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  TrendingUp,
  BarChart3,
  Search,
  ArrowRight,
  ChevronRight,
  Menu,
  X,
  PieChart,
  Activity,
  Layers,
  CheckCircle2,
  GitBranch,
  LineChart,
  Zap,
  SlidersHorizontal,
  BookOpen,
} from "lucide-react";
import {
  AreaChart,
  Area,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

/* ─── Static sample data (illustrative only) ─── */
const portfolioData = [
  { month: "Jan", portfolio: 100, nifty: 100 },
  { month: "Feb", portfolio: 103.2, nifty: 101.5 },
  { month: "Mar", portfolio: 98.7, nifty: 97.2 },
  { month: "Apr", portfolio: 108.4, nifty: 103.8 },
  { month: "May", portfolio: 115.6, nifty: 107.1 },
  { month: "Jun", portfolio: 112.3, nifty: 105.4 },
  { month: "Jul", portfolio: 121.8, nifty: 110.2 },
  { month: "Aug", portfolio: 118.5, nifty: 108.7 },
  { month: "Sep", portfolio: 128.3, nifty: 113.5 },
  { month: "Oct", portfolio: 132.7, nifty: 116.8 },
  { month: "Nov", portfolio: 138.4, nifty: 119.3 },
];

const allocationData = [
  { name: "IT", value: 35, fill: "#1C3AA9" },
  { name: "Banking", value: 25, fill: "#1E3A5F" },
  { name: "Energy", value: 20, fill: "#166534" },
  { name: "FMCG", value: 12, fill: "#92400E" },
  { name: "Others", value: 8, fill: "#64748B" },
];

const rsiData = [
  { stock: "INFY", rsi: 62 },
  { stock: "RELIANCE", rsi: 54 },
  { stock: "TCS", rsi: 71 },
  { stock: "HDFCBANK", rsi: 48 },
  { stock: "ITC", rsi: 38 },
  { stock: "WIPRO", rsi: 59 },
];

const features = [
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    desc: "Understand investment performance through quantitative metrics — returns, volatility, Sharpe ratio, and drawdown analysis.",
    tag: "Core",
  },
  {
    icon: Activity,
    title: "Technical Indicators",
    desc: "Server-computed SMA(20/50/200), EMA(12/26), RSI(14), MACD, and Bollinger Bands on live Yahoo Finance price history.",
    tag: "Quantitative",
  },
  {
    icon: Search,
    title: "Stock Screener",
    desc: "Filter 35+ NSE equities by sector, market cap, P/E range, and dividend yield. Export filtered results to CSV instantly.",
    tag: "Discovery",
  },
  {
    icon: Layers,
    title: "Composite Scoring",
    desc: "Deterministic 100-point scoring engine weighting technicals (40 pts), fundamentals (35 pts), and your risk profile (25 pts).",
    tag: "Proprietary",
  },
  {
    icon: SlidersHorizontal,
    title: "Risk Analysis",
    desc: "Assess annualized volatility, beta estimates, and risk-adjusted returns. Compare positions against NIFTY 50 benchmark.",
    tag: "Risk",
  },
  {
    icon: PieChart,
    title: "Multi-Stock Compare",
    desc: "Side-by-side comparison of up to 5 stocks — price performance, fundamentals, technical signals, and composite scores.",
    tag: "Comparison",
  },
];

const steps = [
  {
    num: "01",
    title: "Set Your Investor Profile",
    desc: "Input your financial details — income, expenses, risk appetite, investment horizon, and goals. The platform tailors scoring to your profile.",
  },
  {
    num: "02",
    title: "Screen & Analyze Stocks",
    desc: "Use the stock screener to narrow down opportunities, then dive into full technical and fundamental analysis for any NSE equity.",
  },
  {
    num: "03",
    title: "Generate Meaningful Insights",
    desc: "Compare stocks, review composite scores, track your watchlist, and export analysis for data-driven investment decisions.",
  },
];

const insightCards = [
  {
    title: "Portfolio vs Benchmark",
    desc: "+38.4% portfolio return vs +19.3% NIFTY over 11 months",
    tag: "Performance",
    color: "#166534",
    bg: "#F0FDF4",
  },
  {
    title: "Top Sector Allocation",
    desc: "IT sector (35%) drives outsized alpha; Energy acts as stabilizer",
    tag: "Allocation",
    color: "#1C3AA9",
    bg: "#EFF6FF",
  },
  {
    title: "Overbought Signal",
    desc: "TCS RSI at 71 — approaching overbought zone. HDFCBANK RSI neutral at 48",
    tag: "Technical",
    color: "#92400E",
    bg: "#FFFBEB",
  },
  {
    title: "Composite Score Leader",
    desc: "RELIANCE scores 78/100 — Strong fundamentals offset moderate RSI",
    tag: "Scoring",
    color: "#6B21A8",
    bg: "#FAF5FF",
  },
];

const kpis = [
  { label: "Portfolio Return", value: "+38.4%", sub: "vs +19.3% NIFTY", positive: true },
  { label: "Sharpe Ratio", value: "1.42", sub: "Risk-adjusted return", positive: true },
  { label: "Annualized Volatility", value: "14.2%", sub: "12-month window", positive: null },
  { label: "Stocks Analyzed", value: "35+", sub: "NSE equities covered", positive: null },
];

/* ─── Animation variants ─── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

/* ─── Custom Tooltip ─── */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
      <p style={{ fontWeight: 600, color: "#1C2340", marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {p.value.toFixed(1)}
        </p>
      ))}
    </div>
  );
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const motionProps = (delay = 0) =>
    shouldReduceMotion
      ? {}
      : {
          initial: "hidden",
          whileInView: "visible",
          viewport: { once: true, margin: "-60px" },
          variants: fadeUp,
          transition: { delay },
        };

  return (
    <div
      style={{ background: "#FAFAF9", color: "#1C2340", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}
      className="min-h-screen overflow-x-hidden"
    >
      {/* ════════════════════════ NAVBAR ════════════════════════ */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: scrolled ? "rgba(250,250,249,0.95)" : "rgba(250,250,249,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: scrolled ? "1px solid #E5E7EB" : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <nav
          style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}
        >
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div
              style={{ width: 32, height: 32, background: "#1C3AA9", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <TrendingUp size={18} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontWeight: 700, fontSize: 17, color: "#1C2340", letterSpacing: "-0.02em" }}>InvestIntel</span>
          </Link>

          {/* Desktop nav */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="hidden-mobile">
            {["Features", "Analytics", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                style={{ padding: "6px 14px", fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none", borderRadius: 6, transition: "color 0.2s" }}
                onMouseEnter={(e) => ((e.target as HTMLAnchorElement).style.color = "#1C2340")}
                onMouseLeave={(e) => ((e.target as HTMLAnchorElement).style.color = "#475569")}
              >
                {item}
              </a>
            ))}
            <a
              href="https://github.com/Sachin-pandey13/InvestIntel"
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "6px 14px", fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              <GitBranch size={15} />
              GitHub
            </a>
            <Link
              href="/dashboard"
              style={{
                marginLeft: 8,
                padding: "8px 18px",
                background: "#1C3AA9",
                color: "#fff",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 6,
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1E3A8A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1C3AA9")}
            >
              Explore Platform <ArrowRight size={14} />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#1C2340", padding: 4 }}
            className="show-mobile"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div style={{ background: "#FAFAF9", borderTop: "1px solid #E5E7EB", padding: "12px 24px 20px" }}>
            {["Features", "Analytics", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                style={{ display: "block", padding: "10px 0", fontSize: 15, fontWeight: 500, color: "#1C2340", textDecoration: "none", borderBottom: "1px solid #F3F4F6" }}
              >
                {item}
              </a>
            ))}
            <Link
              href="/dashboard"
              onClick={() => setMobileOpen(false)}
              style={{ display: "block", marginTop: 16, padding: "10px 18px", background: "#1C3AA9", color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", textAlign: "center" }}
            >
              Explore Platform
            </Link>
          </div>
        )}
      </header>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .kpi-grid { grid-template-columns: 1fr 1fr !important; }
          .insight-grid { grid-template-columns: 1fr !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .platform-grid { grid-template-columns: 1fr !important; }
          .charts-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>

      {/* ════════════════════════ HERO ════════════════════════ */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px 64px" }}>
        <div
          className="hero-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}
        >
          {/* Left */}
          <motion.div {...(shouldReduceMotion ? {} : { initial: "hidden", animate: "visible", variants: stagger })}>
            <motion.div variants={fadeUp} style={{ marginBottom: 20 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 12px",
                  background: "#EFF6FF",
                  border: "1px solid #BFDBFE",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#1C3AA9",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ width: 6, height: 6, background: "#1C3AA9", borderRadius: "50%", display: "inline-block" }} />
                Financial Analytics Platform
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              style={{ fontSize: "clamp(32px, 4vw, 52px)", fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.03em", color: "#0F172A", marginBottom: 20 }}
            >
              Turn Financial Data
              <br />
              <span style={{ color: "#1C3AA9" }}>Into Smarter</span>
              <br />
              Decisions.
            </motion.h1>

            <motion.p
              variants={fadeUp}
              style={{ fontSize: 17, lineHeight: 1.7, color: "#475569", marginBottom: 32, maxWidth: 480 }}
            >
              Explore market trends, analyze investment performance, and uncover meaningful financial insights through quantitative, data-driven analytics.
            </motion.p>

            <motion.div variants={fadeUp} style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 40 }}>
              <Link
                href="/dashboard"
                style={{
                  padding: "12px 24px",
                  background: "#1C3AA9",
                  color: "#fff",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "background 0.2s, transform 0.1s",
                  boxShadow: "0 1px 3px rgba(28,58,169,0.3)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1E3A8A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "#1C3AA9"; }}
              >
                Explore Analytics <ArrowRight size={16} />
              </Link>
              <a
                href="#analytics"
                style={{
                  padding: "12px 24px",
                  background: "transparent",
                  color: "#1C2340",
                  borderRadius: 8,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  border: "1.5px solid #CBD5E1",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "#1C3AA9"; el.style.color = "#1C3AA9"; }}
                onMouseLeave={(e) => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = "#CBD5E1"; el.style.color = "#1C2340"; }}
              >
                View Demo <ChevronRight size={16} />
              </a>
            </motion.div>

            <motion.div variants={fadeUp} style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
              {["35+ NSE Equities", "6 Technical Indicators", "AES-256 Encrypted", "Open Source"].map((t) => (
                <span key={t} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#64748B", fontWeight: 500 }}>
                  <CheckCircle2 size={14} color="#166534" />
                  {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — Mini Dashboard Preview */}
          <motion.div
            {...(shouldReduceMotion ? {} : { initial: { opacity: 0, x: 24 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.2 } })}
          >
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              {/* Dashboard chrome */}
              <div style={{ background: "#F8FAFC", borderBottom: "1px solid #E5E7EB", padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FCA5A5" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#FCD34D" }} />
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#86EFAC" }} />
                </div>
                <div style={{ flex: 1, background: "#E5E7EB", borderRadius: 4, height: 20, maxWidth: 180, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                  <span style={{ fontSize: 11, color: "#94A3B8" }}>investintel.app/dashboard</span>
                </div>
              </div>

              <div style={{ padding: 16 }}>
                {/* KPI row */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Portfolio Return", value: "+38.4%", color: "#166534", bg: "#F0FDF4" },
                    { label: "Sharpe Ratio", value: "1.42", color: "#1C3AA9", bg: "#EFF6FF" },
                    { label: "Volatility", value: "14.2%", color: "#92400E", bg: "#FFFBEB" },
                  ].map((k) => (
                    <div key={k.label} style={{ background: k.bg, borderRadius: 8, padding: "10px 10px 8px", textAlign: "center" }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: k.color }}>{k.value}</div>
                      <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{k.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1C2340" }}>Portfolio vs NIFTY 50</span>
                    <span style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic" }}>Illustrative data</span>
                  </div>
                  <ResponsiveContainer width="100%" height={130}>
                    <AreaChart data={portfolioData} margin={{ top: 2, right: 2, bottom: 0, left: -20 }}>
                      <defs>
                        <linearGradient id="gPort" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1C3AA9" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#1C3AA9" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gNifty" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748B" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#64748B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="month" tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="portfolio" name="Portfolio" stroke="#1C3AA9" strokeWidth={2} fill="url(#gPort)" dot={false} />
                      <Area type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#94A3B8" strokeWidth={1.5} fill="url(#gNifty)" dot={false} strokeDasharray="4 4" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Signal row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { sym: "INFY", signal: "BUY", color: "#166534", bg: "#F0FDF4" },
                    { sym: "TCS", signal: "HOLD", color: "#92400E", bg: "#FFFBEB" },
                    { sym: "RELIANCE", signal: "BUY", color: "#166534", bg: "#F0FDF4" },
                    { sym: "HDFC", signal: "HOLD", color: "#64748B", bg: "#F8FAFC" },
                  ].map((s) => (
                    <div key={s.sym} style={{ background: s.bg, border: `1px solid ${s.color}22`, borderRadius: 5, padding: "3px 8px", display: "flex", gap: 4, alignItems: "center" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#1C2340" }}>{s.sym}</span>
                      <span style={{ fontSize: 9, fontWeight: 700, color: s.color }}>{s.signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ PLATFORM OVERVIEW ════════════════════════ */}
      <section id="about" style={{ background: "#fff", borderTop: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", padding: "72px 24px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...motionProps()} style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C3AA9", textTransform: "uppercase", letterSpacing: "0.08em" }}>What InvestIntel Does</span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", marginTop: 10, marginBottom: 14 }}>
              A Platform Built for Data-Driven Investing
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
              InvestIntel combines live Yahoo Finance data with quantitative analysis tools so you can make financial decisions based on evidence, not emotion.
            </p>
          </motion.div>

          <motion.div
            {...(shouldReduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: stagger })}
            className="platform-grid"
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40 }}
          >
            {[
              { icon: BookOpen, title: "Data Exploration", desc: "Access historical price data, fundamentals, and financial ratios for 35+ NSE listed equities — all from a single platform.", color: "#1C3AA9" },
              { icon: LineChart, title: "Performance Analysis", desc: "Compute returns, volatility, Sharpe ratio, and Bollinger Band width with deterministic algorithms — no black-box AI guessing.", color: "#166534" },
              { icon: Zap, title: "Actionable Insights", desc: "Composite scoring synthesizes technical signals and your personal risk profile into a clear, ranked recommendation.", color: "#92400E" },
            ].map((item) => (
              <motion.div key={item.title} variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div
                  style={{ width: 44, height: 44, background: `${item.color}14`, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <item.icon size={20} color={item.color} strokeWidth={2} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ FEATURES ════════════════════════ */}
      <section id="features" style={{ padding: "80px 24px", background: "#FAFAF9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...motionProps()} style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C3AA9", textTransform: "uppercase", letterSpacing: "0.08em" }}>Capabilities</span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", marginTop: 10, marginBottom: 12 }}>
              Everything You Need to Analyze Markets
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 480, lineHeight: 1.7 }}>
              Built for transparency — every metric is calculated from first principles, not hidden in a model.
            </p>
          </motion.div>

          <motion.div
            {...(shouldReduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true, margin: "-60px" }, variants: stagger })}
            className="features-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  padding: "24px",
                  transition: "box-shadow 0.2s, border-color 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                whileHover={shouldReduceMotion ? {} : { y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div
                    style={{ width: 40, height: 40, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <f.icon size={18} color="#1C3AA9" strokeWidth={2} />
                  </div>
                  <span
                    style={{ fontSize: 10, fontWeight: 600, color: "#1C3AA9", background: "#EFF6FF", padding: "3px 8px", borderRadius: 999, letterSpacing: "0.04em", textTransform: "uppercase" }}
                  >
                    {f.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ ANALYTICS PREVIEW ════════════════════════ */}
      <section id="analytics" style={{ padding: "80px 24px", background: "#0F172A" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...motionProps()} style={{ textAlign: "center", marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#60A5FA", textTransform: "uppercase", letterSpacing: "0.08em" }}>Analytics Preview</span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F1F5F9", marginTop: 10, marginBottom: 12 }}>
              See What the Dashboard Looks Like
            </h2>
            <p style={{ fontSize: 15, color: "#94A3B8", maxWidth: 500, margin: "0 auto", lineHeight: 1.7 }}>
              Sample Analysis — Illustrative Data Only. Not representative of live market performance.
            </p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            {...(shouldReduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: stagger })}
            className="kpi-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}
          >
            {kpis.map((k) => (
              <motion.div
                key={k.label}
                variants={fadeUp}
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 20px 16px" }}
              >
                <div style={{ fontSize: 24, fontWeight: 800, color: k.positive === true ? "#4ADE80" : k.positive === false ? "#F87171" : "#F1F5F9", marginBottom: 4 }}>
                  {k.value}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9", marginBottom: 2 }}>{k.label}</div>
                <div style={{ fontSize: 12, color: "#64748B" }}>{k.sub}</div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <motion.div
            {...motionProps(0.1)}
            className="charts-grid"
            style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}
          >
            {/* Portfolio performance chart */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>Portfolio vs NIFTY 50</h3>
                  <p style={{ fontSize: 12, color: "#64748B" }}>Indexed to 100 — 11-month window</p>
                </div>
                <div style={{ display: "flex", gap: 16, fontSize: 11 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8" }}>
                    <span style={{ display: "inline-block", width: 20, height: 2, background: "#60A5FA", borderRadius: 2 }} /> Portfolio
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8" }}>
                    <span style={{ display: "inline-block", width: 20, height: 2, background: "#64748B", borderRadius: 2, borderTop: "2px dashed #64748B" }} /> NIFTY 50
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <ComposedChart data={portfolioData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} domain={[90, 145]} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="portfolio" name="Portfolio" stroke="#60A5FA" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="nifty" name="NIFTY 50" stroke="#64748B" strokeWidth={1.5} dot={false} strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Allocation pie */}
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>Asset Allocation</h3>
              <p style={{ fontSize: 12, color: "#64748B", marginBottom: 16 }}>By sector weight</p>
              <ResponsiveContainer width="100%" height={160}>
                <RPieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={2} dataKey="value">
                    {allocationData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => [`${v}%`, ""]} contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                </RPieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {allocationData.map((d) => (
                  <div key={d.name} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: d.fill, flexShrink: 0 }} />
                    <span style={{ color: "#94A3B8", flex: 1 }}>{d.name}</span>
                    <span style={{ color: "#F1F5F9", fontWeight: 600 }}>{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* RSI distribution */}
          <motion.div {...motionProps(0.15)} style={{ marginTop: 16, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>RSI Signal Distribution</h3>
                <p style={{ fontSize: 12, color: "#64748B" }}>Relative Strength Index across screened stocks</p>
              </div>
              <div style={{ display: "flex", gap: 12, fontSize: 11, color: "#64748B" }}>
                <span>{"<30 Oversold"}</span>
                <span>30-70 Neutral</span>
                <span>{">70 Overbought"}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <ComposedChart data={rsiData} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="stock" tick={{ fontSize: 11, fill: "#94A3B8" }} axisLine={false} tickLine={false} width={70} />
                <Tooltip contentStyle={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="rsi" name="RSI" radius={[0, 4, 4, 0]}>
                  {rsiData.map((entry) => (
                    <Cell
                      key={entry.stock}
                      fill={entry.rsi > 70 ? "#F87171" : entry.rsi < 30 ? "#4ADE80" : "#60A5FA"}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ HOW IT WORKS ════════════════════════ */}
      <section style={{ padding: "80px 24px", background: "#fff", borderTop: "1px solid #E5E7EB" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...motionProps()} style={{ textAlign: "center", marginBottom: 56 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C3AA9", textTransform: "uppercase", letterSpacing: "0.08em" }}>Workflow</span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", marginTop: 10 }}>
              How It Works
            </h2>
          </motion.div>

          <motion.div
            {...(shouldReduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: stagger })}
            className="steps-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, position: "relative" }}
          >
            {steps.map((step, i) => (
              <motion.div key={step.num} variants={fadeUp} style={{ position: "relative", padding: "0 32px 0 0" }}>
                {/* Connecting line */}
                {i < steps.length - 1 && (
                  <div
                    style={{ position: "absolute", top: 22, left: "calc(100% - 16px)", right: -16, height: 1, background: "linear-gradient(to right, #CBD5E1, #E5E7EB)", zIndex: 0 }}
                    className="hidden-mobile"
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "relative", zIndex: 1 }}>
                  <div
                    style={{ width: 44, height: 44, borderRadius: "50%", background: "#1C3AA9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800 }}
                  >
                    {step.num}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{step.title}</h3>
                    <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.65 }}>{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ INSIGHTS ════════════════════════ */}
      <section style={{ padding: "80px 24px", background: "#FAFAF9" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <motion.div {...motionProps()} style={{ marginBottom: 48 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#1C3AA9", textTransform: "uppercase", letterSpacing: "0.08em" }}>Sample Insights</span>
            <h2 style={{ fontSize: "clamp(24px, 3vw, 36px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#0F172A", marginTop: 10, marginBottom: 12 }}>
              The Kind of Analysis You Can Generate
            </h2>
            <p style={{ fontSize: 16, color: "#64748B", maxWidth: 480, lineHeight: 1.7 }}>
              These are illustrative examples of analytical outputs — not financial advice.
            </p>
          </motion.div>

          <motion.div
            {...(shouldReduceMotion ? {} : { initial: "hidden", whileInView: "visible", viewport: { once: true }, variants: stagger })}
            className="insight-grid"
            style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20 }}
          >
            {insightCards.map((card) => (
              <motion.div
                key={card.title}
                variants={fadeUp}
                style={{
                  background: card.bg,
                  border: `1px solid ${card.color}22`,
                  borderRadius: 12,
                  padding: "24px 24px 20px",
                  transition: "transform 0.2s",
                }}
                whileHover={shouldReduceMotion ? {} : { y: -2 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span
                    style={{ fontSize: 10, fontWeight: 700, color: card.color, background: `${card.color}18`, padding: "3px 8px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}
                  >
                    {card.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>{card.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════ FINAL CTA ════════════════════════ */}
      <section style={{ padding: "96px 24px", background: "#0F172A" }}>
        <motion.div {...motionProps()} style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{ width: 56, height: 56, background: "#1C3AA9", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}
          >
            <TrendingUp size={26} color="#fff" strokeWidth={2} />
          </div>
          <h2 style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "#F1F5F9", marginBottom: 16, lineHeight: 1.15 }}>
            Make Your Financial Data
            <br />More Meaningful.
          </h2>
          <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 36, lineHeight: 1.7 }}>
            Explore stocks quantitatively, track your watchlist, and generate analysis you can actually explain — built for data analysts and investors.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/dashboard"
              style={{
                padding: "14px 28px",
                background: "#1C3AA9",
                color: "#fff",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                transition: "background 0.2s",
                boxShadow: "0 1px 3px rgba(28,58,169,0.4)",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1E3A8A")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1C3AA9")}
            >
              Open Dashboard <ArrowRight size={16} />
            </Link>
            <a
              href="https://github.com/Sachin-pandey13/InvestIntel"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "14px 28px",
                background: "transparent",
                color: "#F1F5F9",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: 8,
                border: "1.5px solid rgba(255,255,255,0.15)",
                transition: "border-color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.4)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.15)")}
            >
              <GitBranch size={16} /> View on GitHub
            </a>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════ FOOTER ════════════════════════ */}
      <footer style={{ background: "#0A0F1E", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40, marginBottom: 40 }} className="platform-grid">
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <div style={{ width: 28, height: 28, background: "#1C3AA9", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TrendingUp size={15} color="#fff" strokeWidth={2.5} />
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#F1F5F9" }}>InvestIntel</span>
              </div>
              <p style={{ fontSize: 13.5, color: "#64748B", lineHeight: 1.65, maxWidth: 280 }}>
                A quantitative stock analytics platform built to explore, analyze, and understand financial data — designed as a data analyst portfolio project.
              </p>
            </div>

            {/* Nav */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Platform</h4>
              {["Dashboard", "Stock Screener", "Analyze", "Watchlist", "Compare"].map((link) => (
                <div key={link} style={{ marginBottom: 8 }}>
                  <Link
                    href="/dashboard"
                    style={{ fontSize: 13.5, color: "#64748B", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F1F5F9")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")}
                  >
                    {link}
                  </Link>
                </div>
              ))}
            </div>

            {/* Links */}
            <div>
              <h4 style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>Resources</h4>
              <div style={{ marginBottom: 8 }}>
                <a
                  href="https://github.com/Sachin-pandey13/InvestIntel"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13.5, color: "#64748B", textDecoration: "none", display: "flex", alignItems: "center", gap: 6, transition: "color 0.2s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F1F5F9")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")}
                >
                  <GitBranch size={13} /> GitHub Repository
                </a>
              </div>
              <div style={{ marginBottom: 8 }}>
                <a href="#features" style={{ fontSize: 13.5, color: "#64748B", textDecoration: "none" }}>Features</a>
              </div>
              <div>
                <a href="#analytics" style={{ fontSize: 13.5, color: "#64748B", textDecoration: "none" }}>Analytics Preview</a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontSize: 13, color: "#475569" }}>© 2026 InvestIntel. Built as an open-source data analytics project.</p>
            <p style={{ fontSize: 12, color: "#334155" }}>For demonstration and portfolio purposes only. Not financial advice.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
