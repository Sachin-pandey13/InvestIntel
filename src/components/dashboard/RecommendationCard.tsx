"use client";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Shield, Zap, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";

const RECOMMENDATIONS_BY_RISK: Record<
  string,
  { symbol: string; name: string; reason: string; score: number; tag: string }[]
> = {
  Low: [
    {
      symbol: "HDFCBANK.NS",
      name: "HDFC Bank Ltd",
      reason: "Large-cap banking leader with low volatility & consistent earnings",
      score: 84,
      tag: "Large Cap",
    },
    {
      symbol: "ITC.NS",
      name: "ITC Ltd",
      reason: "High dividend yield (~3%+) and defensive FMCG cashflows",
      score: 82,
      tag: "Dividend",
    },
    {
      symbol: "TCS.NS",
      name: "Tata Consultancy Services",
      reason: "Strong balance sheet, steady dividend & global IT leadership",
      score: 80,
      tag: "Blue Chip",
    },
  ],
  Moderate: [
    {
      symbol: "RELIANCE.NS",
      name: "Reliance Industries",
      reason: "Diversified energy, retail & telecom growth with balanced risk",
      score: 83,
      tag: "Core Growth",
    },
    {
      symbol: "INFY.NS",
      name: "Infosys Ltd",
      reason: "Balanced valuation, healthy ROE and consistent dividend payout",
      score: 79,
      tag: "IT Value",
    },
    {
      symbol: "ICICIBANK.NS",
      name: "ICICI Bank Ltd",
      reason: "Strong credit growth & improving asset quality metrics",
      score: 81,
      tag: "Banking",
    },
  ],
  High: [
    {
      symbol: "TATAMOTORS.NS",
      name: "Tata Motors Ltd",
      reason: "High-beta EV & global auto momentum suited for growth horizon",
      score: 78,
      tag: "Momentum",
    },
    {
      symbol: "BAJFINANCE.NS",
      name: "Bajaj Finance Ltd",
      reason: "High-growth NBFC with strong AUM expansion",
      score: 80,
      tag: "High Growth",
    },
    {
      symbol: "ADANIENT.NS",
      name: "Adani Enterprises",
      reason: "High-volatility infrastructure & energy incubation play",
      score: 72,
      tag: "High Beta",
    },
  ],
};

export default function RecommendationCard() {
  const { user } = useAuth();
  const risk = (user?.riskAppetite as "Low" | "Moderate" | "High") || "Moderate";
  const horizon = user?.timeHorizon || "Long-term";
  const monthlySavings = Math.max(0, (user?.income || 0) - (user?.expenses || 0) - (user?.emi || 0));

  const picks = RECOMMENDATIONS_BY_RISK[risk] || RECOMMENDATIONS_BY_RISK.Moderate;
  const RiskIcon = risk === "Low" ? Shield : risk === "High" ? Zap : TrendingUp;

  return (
    <div className="glass p-5 rounded-2xl border border-white/[0.06] h-full flex flex-col">
      <div className="flex items-start justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#a78bfa]" />
            <h2 className="text-sm font-semibold text-[#f1f5f9]">Recommended for You</h2>
          </div>
          <p className="text-xs text-[#64748b] mt-1">
            Matched to <span className="text-[#a78bfa] font-medium">{risk} Risk</span> • {horizon}
            {monthlySavings > 0 && ` • ~₹${monthlySavings.toLocaleString("en-IN")}/mo investable`}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#7c3aed]/15 text-[#a78bfa] border border-[#7c3aed]/25 shrink-0">
          <RiskIcon className="w-3 h-3" /> {risk}
        </span>
      </div>

      <div className="space-y-2.5 flex-1">
        {picks.map((pick, idx) => (
          <motion.div
            key={pick.symbol}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
          >
            <Link
              href={`/dashboard/analyze?symbol=${encodeURIComponent(pick.symbol)}`}
              className="block p-3.5 rounded-xl bg-white/[0.025] hover:bg-white/[0.05] border border-white/[0.05] transition-colors group"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#f1f5f9]">{pick.symbol}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/[0.06] text-[#94a3b8]">
                    {pick.tag}
                  </span>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#34d399]/15 text-[#34d399]">
                  Fit {pick.score}/100
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] line-clamp-1">{pick.reason}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      <Link
        href="/dashboard/screener"
        className="mt-4 pt-3 border-t border-white/[0.05] text-xs font-medium text-[#67e8f9] hover:text-[#a5f3fc] flex items-center justify-between"
      >
        <span>Customize filters in Stock Screener</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
