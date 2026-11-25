"use client";
import { motion } from "framer-motion";
import { Briefcase, TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const holdings = [
  { name: "ICICI Bank",  qty: 50,  avg: 980,   cmp: 1124,  gain: "+14.7%", up: true  },
  { name: "Infosys",     qty: 20,  avg: 1640,   cmp: 1842,  gain: "+12.3%", up: true  },
  { name: "Reliance",    qty: 10,  avg: 2780,   cmp: 2987,  gain: "+7.4%",  up: true  },
  { name: "TCS",         qty: 5,   avg: 3850,   cmp: 3724,  gain: "-3.3%",  up: false },
  { name: "HDFC Bank",   qty: 30,  avg: 1540,   cmp: 1631,  gain: "+5.9%",  up: true  },
];

const perfData = [
  { m: "Nov", v: 1320000 }, { m: "Dec", v: 1450000 }, { m: "Jan", v: 1510000 },
  { m: "Feb", v: 1480000 }, { m: "Mar", v: 1620000 }, { m: "Apr", v: 1875430 },
];

export default function PortfolioPage() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold tracking-tight text-white mb-1">My Portfolio</h1>
        <p className="text-[14px] text-[#475569]">Track holdings, performance and diversification.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Value",      value: "₹18,75,430", color: "#a78bfa" },
          { label: "Total Invested",   value: "₹16,24,000", color: "#60a5fa" },
          { label: "Total P&L",        value: "+₹2,51,430", color: "#34d399" },
          { label: "XIRR",             value: "18.2%",       color: "#fbbf24" },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="metric-card">
            <p className="text-[11.5px] text-[#475569] mb-3">{m.label}</p>
            <p className="text-[22px] font-bold" style={{ color: m.color }}>{m.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }} className="glass p-5">
        <h3 className="text-[14px] font-semibold text-white mb-4">Portfolio Performance</h3>
        <div style={{ height: "200px" }}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={perfData}>
              <defs>
                <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.04)" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
              <YAxis hide domain={["dataMin - 100000", "dataMax + 100000"]} />
              <Tooltip
                contentStyle={{ background: "rgba(10,22,40,0.95)", border: "1px solid rgba(148,163,184,0.1)", borderRadius: "10px", fontSize: "12px" }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString("en-IN")}`, "Portfolio"]}
              />
              <Area type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2}
                fill="url(#portGrad)" dot={false}
                activeDot={{ r: 4, fill: "#7c3aed", stroke: "#020617", strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Holdings Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }} className="glass p-5">
        <h3 className="text-[14px] font-semibold text-white mb-4">Holdings</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                {["Stock", "Qty", "Avg Cost", "CMP", "P&L"].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[11px] font-semibold text-[#334155] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {holdings.map((row, i) => (
                <tr key={i} className="border-b hover:bg-white/[0.02] transition-all cursor-pointer"
                  style={{ borderColor: "rgba(255,255,255,0.03)" }}>
                  <td className="py-3 px-3 text-[13px] font-semibold text-[#cbd5e1]">{row.name}</td>
                  <td className="py-3 px-3 text-[13px] text-[#64748b]">{row.qty}</td>
                  <td className="py-3 px-3 text-[13px] text-[#64748b]">₹{row.avg.toLocaleString()}</td>
                  <td className="py-3 px-3 text-[13px] text-white font-medium">₹{row.cmp.toLocaleString()}</td>
                  <td className="py-3 px-3">
                    <span className="flex items-center gap-1 text-[12px] font-bold"
                      style={{ color: row.up ? "#34d399" : "#f87171" }}>
                      {row.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {row.gain}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
