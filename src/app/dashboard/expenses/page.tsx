"use client";
import { motion } from "framer-motion";
import { Receipt, TrendingDown, Lightbulb } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const spendData = [
  { month: "Nov", amount: 42000 }, { month: "Dec", amount: 58000 },
  { month: "Jan", amount: 51000 }, { month: "Feb", amount: 47000 },
  { month: "Mar", amount: 63000 }, { month: "Apr", amount: 56430 },
];

export default function ExpensesPage() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-white mb-1">Expense Intelligence</h1>
        <p className="text-[14px] text-[#475569]">Smart spending analysis and AI-powered saving tips.</p>
      </div>
      <div className="glass p-5">
        <h3 className="text-[14px] font-semibold text-white mb-5">Monthly Spending Trend</h3>
        <div style={{ height: "240px" }}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={spendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.04)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "rgba(10,22,40,0.95)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "10px", fontSize: "12px" }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Spent"]}
              />
              <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="glass p-5">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-4 h-4 text-[#fbbf24]" />
          <h3 className="text-[14px] font-semibold text-white">AI Savings Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[
            "Food delivery spend is 42% higher than last month. Reducing by 20% saves ₹1,200/month.",
            "You have 3 unused subscriptions totalling ₹899/month. Consider cancelling them.",
            "Shopping expenses peak on weekends. Setting a weekend budget cap could save ₹2,400/month.",
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.1)" }}>
              <span className="w-5 h-5 rounded-full bg-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i+1}</span>
              <p className="text-[13px] text-[#94a3b8] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
