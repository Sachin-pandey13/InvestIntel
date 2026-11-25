"use client";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Shield, Brain, Wallet } from "lucide-react";
import AnimatedCounter from "@/components/common/AnimatedCounter";
import { useAuth } from "@/contexts/AuthContext";

export default function PortfolioCards() {
  const { user } = useAuth();
  
  // Dynamic calculation
  const totalValue = (user?.savings || 0) + ((user?.savings || 0) * 1.5); // Mock investment value
  const gainValue = totalValue * 0.0135;
  const healthScore = user?.financialHealthScore || 50;

  const cards = [
    {
      label: "Total Portfolio Value",
      value: totalValue.toString(),
      display: `₹${totalValue.toLocaleString("en-IN")}`,
      change: "+12.45%",
      sub: "All Time",
      positive: true,
      icon: Wallet,
      accent: "#a78bfa",
      spark: "#7c3aed",
      path: "M0,30 C10,28 20,10 30,12 S50,5 60,8 S80,2 100,0",
    },
    {
      label: "Today's Gain",
      value: gainValue.toString(),
      display: `₹${Math.round(gainValue).toLocaleString("en-IN")}`,
      change: "+1.35%",
      sub: "vs yesterday",
      positive: true,
      icon: TrendingUp,
      accent: "#34d399",
      spark: "#059669",
      path: "M0,25 C15,22 25,10 40,8 S65,2 80,4 S90,1 100,0",
    },
    {
      label: "Health Score",
      value: healthScore.toString(),
      display: healthScore >= 70 ? "Excellent" : healthScore >= 40 ? "Moderate" : "Needs Work",
      change: healthScore.toString(),
      sub: "out of 100",
      positive: healthScore >= 70 ? true : healthScore >= 40 ? null : false,
      icon: Shield,
      accent: "#fbbf24",
      spark: "#d97706",
      path: "M0,15 C20,14 35,20 50,18 S75,16 100,15",
    },
    {
      label: "AI Confidence",
      value: "87",
      display: "High",
      change: "87%",
      sub: "model accuracy",
      positive: true,
      icon: Brain,
      accent: "#67e8f9",
      spark: "#06b6d4",
      path: "M0,25 C10,20 30,8 45,10 S70,3 85,2 S95,1 100,0",
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          className="metric-card group relative overflow-hidden"
        >
          {/* Subtle top-edge gradient line */}
          <div
            className="absolute top-0 left-4 right-4 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${card.accent}50, transparent)` }}
          />

          {/* Label + Icon */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11.5px] font-medium text-[#475569] tracking-wide">{card.label}</p>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${card.accent}14` }}
            >
              <card.icon className="w-4 h-4" style={{ color: card.accent }} />
            </div>
          </div>

          {/* Sparkline */}
          <div className="relative mb-1 h-[52px]">
            <svg
              viewBox="0 0 100 32"
              className="w-full h-full absolute inset-0"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id={`sg${i}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={card.spark} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={card.spark} stopOpacity="0" />
                </linearGradient>
              </defs>
              <path
                d={`${card.path} L100,32 L0,32 Z`}
                fill={`url(#sg${i})`}
              />
              <path
                d={card.path}
                fill="none"
                stroke={card.spark}
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            {/* Big value on top */}
            <p className="relative z-10 text-[22px] font-bold text-white tracking-tight leading-none pt-1">
              {card.display}
            </p>
          </div>

          {/* Change row */}
          <div className="flex items-center gap-1.5 mt-2">
            {card.positive === true && <TrendingUp className="w-3.5 h-3.5 text-[#34d399]" />}
            {card.positive === false && <TrendingDown className="w-3.5 h-3.5 text-[#f87171]" />}
            <span
              className="text-[13px] font-bold"
              style={{
                color: card.positive === true ? "#34d399" : card.positive === false ? "#f87171" : "#fbbf24",
              }}
            >
              {card.change}
            </span>
            <span className="text-[11px] text-[#334155]">{card.sub}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
