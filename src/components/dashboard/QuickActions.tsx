"use client";
import { motion } from "framer-motion";
import { TrendingUp, Plus, FileCheck, ShieldAlert } from "lucide-react";

const actions = [
  { label: "Invest Now",           icon: TrendingUp,  color: "#a78bfa", bg: "rgba(124,58,237,0.12)"  },
  { label: "Add Expense",          icon: Plus,        color: "#34d399", bg: "rgba(5,150,105,0.12)"   },
  { label: "Check Loan Eligibility", icon: FileCheck, color: "#60a5fa", bg: "rgba(37,99,235,0.12)"   },
  { label: "Fraud Check",          icon: ShieldAlert, color: "#fbbf24", bg: "rgba(217,119,6,0.12)"   },
];

export default function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-5"
    >
      <h3 className="text-[14px] font-semibold text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-3">
        {actions.map((a, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -3, scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex flex-col items-center gap-2.5 py-4 rounded-xl cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: a.bg }}
            >
              <a.icon className="w-5 h-5" style={{ color: a.color }} />
            </div>
            <span className="text-[11px] font-medium text-[#64748b] text-center leading-tight px-1">
              {a.label}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
