"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  PieChart,
  Landmark,
  Zap,
  TrendingUp,
  Activity,
  Lock,
  ChevronRight,
  Sparkles,
  Bot,
  Database,
} from "lucide-react";

import HeroOrb from "@/components/3d/HeroOrb";

/* ── Ticker data ── */
const tickers = [
  { sym: "NIFTY 50", val: "24,856.35", change: "+1.25%", up: true },
  { sym: "SENSEX", val: "81,234.12", change: "+0.87%", up: true },
  { sym: "NASDAQ", val: "17,890.78", change: "-0.34%", up: false },
  { sym: "INFOSYS", val: "1,842.60", change: "+2.1%", up: true },
  { sym: "RELIANCE", val: "2,987.45", change: "+0.65%", up: true },
  { sym: "ICICI BANK", val: "1,124.30", change: "+1.87%", up: true },
  { sym: "BTC/USD", val: "$68,450", change: "+3.2%", up: true },
  { sym: "USDT/INR", val: "83.42", change: "-0.12%", up: false },
];

const features = [
  {
    icon: BrainCircuit,
    title: "Technical Indicators",
    desc: "Server-side SMA(20/50/200), EMA(12/26), RSI(14), MACD, and Bollinger Bands computed on live price history.",
    color: "purple",
    badge: "Quantitative",
  },
  {
    icon: ShieldCheck,
    title: "Stock Screener",
    desc: "Filter NSE equities by sector, market cap, P/E valuation, and dividend yield with instant CSV export.",
    color: "emerald",
    badge: "Live NSE Data",
  },
  {
    icon: PieChart,
    title: "Multi-Stock Compare",
    desc: "Compare up to 5 stocks side-by-side against NIFTY 50 with annualized volatility and valuation metrics.",
    color: "cyan",
    badge: "Benchmarking",
  },
  {
    icon: Landmark,
    title: "Composite Scoring",
    desc: "Deterministic 100-point scoring engine combining technicals, fundamentals, and your personal risk profile.",
    color: "gold",
    badge: "Profile-Aware",
  },
];

const orchestrationNodes = [
  { label: "Yahoo Finance API", icon: Zap, color: "#67e8f9", side: "left" },
  { label: "Quantitative Engine", icon: Bot, color: "#a78bfa", side: "center" },
  { label: "Technicals (RSI/MACD)", icon: BrainCircuit, color: "#818cf8", side: "right" },
  { label: "Composite Scorer", icon: ShieldCheck, color: "#34d399", side: "right" },
  { label: "MongoDB Cache", icon: Database, color: "#60a5fa", side: "right" },
];

const metrics = [
  { label: "Technical Indicators", value: "6+", icon: Activity },
  { label: "Scoring Scale", value: "0–100", icon: TrendingUp },
  { label: "Tracked NSE Equities", value: "35+", icon: Zap },
  { label: "Data Encryption", value: "AES-256", icon: Lock },
];

const colorMap: Record<string, string> = {
  purple: "#a78bfa",
  emerald: "#34d399",
  cyan: "#67e8f9",
  gold: "#fbbf24",
};

const bgMap: Record<string, string> = {
  purple: "rgba(124,58,237,0.12)",
  emerald: "rgba(5,150,105,0.12)",
  cyan: "rgba(6,182,212,0.12)",
  gold: "rgba(217,119,6,0.12)",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export default function LandingPage() {
  const tickerDouble = [...tickers, ...tickers];

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] overflow-x-hidden">

      {/* ── AMBIENT BLOBS ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="ambient-blob w-[700px] h-[700px] bg-purple/30 opacity-25"
          style={{ top: "-200px", left: "-200px" }} />
        <div className="ambient-blob w-[600px] h-[600px] bg-cyan/20 opacity-20"
          style={{ top: "200px", right: "-150px" }} />
        <div className="ambient-blob w-[500px] h-[500px] bg-emerald/15 opacity-15"
          style={{ bottom: "-100px", left: "30%" }} />
      </div>

      {/* ── NAVBAR ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.05]"
        style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(20px)" }}>
        <div className="max-w-7xl mx-auto px-8 h-[68px] flex items-center justify-between">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span className="text-[17px] font-bold tracking-tight">
              <span className="text-gradient-purple">Invest</span>
              <span className="text-white">Intel</span>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {["Features", "AI Engine", "Security", "Pricing"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`}
                className="px-4 py-2 rounded-lg text-sm text-[#64748b] hover:text-[#f1f5f9] hover:bg-white/[0.04] transition-all">
                {item}
              </a>
            ))}
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="btn-secondary text-sm py-2 px-4">
              Sign in
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm py-2.5 px-5">
              Launch App
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── LIVE TICKER ── */}
      <div className="border-b border-white/[0.05] bg-white/[0.02] overflow-hidden py-2.5">
        <div className="flex animate-ticker" style={{ width: "max-content" }}>
          {tickerDouble.map((t, i) => (
            <div key={i} className="flex items-center gap-2 px-8 border-r border-white/[0.06]">
              <span className="text-[11px] font-semibold text-[#475569] tracking-wider">{t.sym}</span>
              <span className="text-[12px] font-bold text-[#f1f5f9]">{t.val}</span>
              <span className={`text-[11px] font-semibold ${t.up ? "text-[#34d399]" : "text-[#f87171]"}`}>
                {t.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-24 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[580px]">

          {/* Left Copy */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-6 lg:col-span-7"
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)", color: "#a78bfa" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#a78bfa] animate-pulse" />
                Quantitative Equity Research &amp; Stock Analysis Platform
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp}
              className="text-5xl lg:text-7xl font-extrabold leading-[1.08] tracking-tighter text-white">
              Analyze stocks<br />
              <span className="text-gradient">quantitatively</span><br />
              not blindly.
            </motion.h1>

            <motion.p variants={fadeUp}
              className="text-[17px] lg:text-[19px] leading-[1.7] text-[#94a3b8] max-w-[600px]">
              InvestIntel combines live Yahoo Finance market data, server-side technical indicators
              (RSI, MACD, Bollinger Bands), and a transparent 100-point scoring model tailored to your financial profile.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/dashboard" className="btn-primary">
                <Sparkles className="w-4 h-4" />
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#features" className="btn-secondary">
                See how it works
                <ChevronRight className="w-4 h-4" />
              </a>
            </motion.div>

            {/* Social proof */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-8 pt-6 mt-4 border-t border-white/[0.05]">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col">
                  <span className="text-2xl font-extrabold text-white tracking-tight">{m.value}</span>
                  <span className="text-[12px] text-[#64748b] font-medium mt-0.5">{m.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right — 3D CSS Orb */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex items-center justify-center lg:col-span-5 h-[400px] lg:h-[500px]"
          >
            <HeroOrb />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" className="relative z-10 py-28 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.p variants={fadeUp} className="section-eyebrow mb-4">Core Capabilities</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-4xl xl:text-5xl font-extrabold tracking-tighter text-white mb-5">
              Enterprise-grade AI,<br />built for finance.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[17px] text-[#64748b] max-w-2xl mx-auto leading-relaxed">
              Every module is powered by a purpose-built ML model — not a generic chatbot. The orchestration
              layer picks the right model for each task automatically.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ y: -6 }}
                className="glass p-6 flex flex-col gap-4 group cursor-pointer"
                style={{ transition: "transform 0.25s ease" }}
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: bgMap[f.color] }}>
                    <f.icon className="w-6 h-6" style={{ color: colorMap[f.color] }} />
                  </div>
                  <span className="badge badge-purple text-[10px]">{f.badge}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-white mb-2 tracking-tight">{f.title}</h3>
                  <p className="text-[13.5px] text-[#64748b] leading-relaxed">{f.desc}</p>
                </div>
                <div className="mt-auto flex items-center gap-1.5 text-xs font-semibold"
                  style={{ color: colorMap[f.color] }}>
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── AI ORCHESTRATION ENGINE ── */}
      <section id="ai-engine" className="relative z-10 py-28 border-t border-white/[0.05]">
        <div className="max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={containerVariants}
            >
              <motion.p variants={fadeUp} className="section-eyebrow mb-4">Analytics Pipeline</motion.p>
              <motion.h2 variants={fadeUp}
                className="text-4xl xl:text-5xl font-extrabold tracking-tighter text-white mb-6">
                Real market data.<br />
                <span className="text-gradient-purple">Explainable math.</span>
              </motion.h2>
              <motion.p variants={fadeUp} className="text-[16px] text-[#64748b] leading-relaxed mb-8">
                Every chart, indicator, and score in InvestIntel is computed deterministically from live market feeds.
                Your income, monthly surplus, and risk appetite calibrate the 100-point scoring weights automatically.
              </motion.p>
              <motion.div variants={fadeUp} className="space-y-3">
                {[
                  { label: "Live OHLCV & fundamentals via Yahoo Finance", color: "#a78bfa" },
                  { label: "Server-side SMA, EMA, RSI, MACD & Bollinger Bands", color: "#67e8f9" },
                  { label: "Transparent 40 / 35 / 25 weighted scoring model", color: "#34d399" },
                  { label: "MongoDB TTL caching & CSV dataset export", color: "#fbbf24" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                    <span className="text-[14px] text-[#94a3b8]">{item.label}</span>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — Flow Diagram */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="glass p-6 relative overflow-hidden">
                {/* Grid overlay */}
                <div className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "28px 28px",
                  }} />

                <p className="text-xs font-semibold text-[#475569] uppercase tracking-widest mb-5">
                  Orchestration Flow
                </p>

                {/* Flow Nodes */}
                <div className="space-y-3 relative">
                  {/* User Input */}
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(103,232,249,0.08)", border: "1px solid rgba(103,232,249,0.15)" }}>
                    <Zap className="w-5 h-5 text-[#67e8f9]" />
                    <div>
                      <p className="text-[13px] font-semibold text-white">User Query / Request</p>
                      <p className="text-[11px] text-[#475569]">Natural language or structured input</p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-center">
                    <div className="w-px h-6 bg-gradient-to-b from-[#67e8f9] to-[#a78bfa]" />
                  </div>

                  {/* Router */}
                  <div className="flex items-center gap-3 p-3 rounded-xl"
                    style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.25)" }}>
                    <Bot className="w-5 h-5 text-[#a78bfa]" />
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-white">Smart AI Router</p>
                      <p className="text-[11px] text-[#475569]">LangChain orchestration layer</p>
                    </div>
                    <span className="badge badge-purple">Core</span>
                  </div>

                  {/* Parallel branches */}
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {[
                      { label: "LLM (GPT-4)", sub: "Complex reasoning", color: "#818cf8", icon: BrainCircuit },
                      { label: "ML Model", sub: "Fraud / Loan", color: "#34d399", icon: ShieldCheck },
                      { label: "Vector DB", sub: "Context lookup", color: "#60a5fa", icon: Database },
                    ].map((node, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.3 }}
                        className="p-3 rounded-xl text-center"
                        style={{ background: `${node.color}12`, border: `1px solid ${node.color}20` }}
                      >
                        <node.icon className="w-4 h-4 mx-auto mb-1.5" style={{ color: node.color }} />
                        <p className="text-[11.5px] font-semibold text-white">{node.label}</p>
                        <p className="text-[10px] text-[#475569] mt-0.5">{node.sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {["Smart Routing", "Fallback Handling", "Cost Optimisation", "Real-time Monitoring"].map((tag) => (
                      <span key={tag} className="text-[10.5px] font-medium text-[#475569] px-2.5 py-1 rounded-lg"
                        style={{ background: "rgba(255,255,255,0.04)" }}>
                        • {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="relative z-10 py-28 border-t border-white/[0.05]">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.div variants={fadeUp}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-8"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
              <span className="status-dot dot-green w-2 h-2" />
              Live — Zero setup required
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-5xl font-extrabold tracking-tighter text-white mb-6">
              Ready to invest<br />
              <span className="text-gradient">intelligently?</span>
            </motion.h2>
            <motion.p variants={fadeUp}
              className="text-[17px] text-[#64748b] mb-10">
              Screen NSE equities, inspect technical indicators, and benchmark stocks against your personal financial goals.
            </motion.p>
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
              <Link href="/dashboard" className="btn-primary text-base px-8 py-3.5">
                <Sparkles className="w-5 h-5" />
                Start for free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <span className="text-[15px] font-bold">
            <span className="text-gradient-purple">Invest</span>
            <span className="text-white">Intel</span>
          </span>
          <p className="text-xs text-[#334155]">© 2026 InvestIntel AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
