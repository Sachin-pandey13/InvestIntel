"use client";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const txns = [
  { name: "Zomato",  cat: "Food & Dining",  amount: 560,  time: "Today",     emoji: "🍕", color: "#ef4444" },
  { name: "Uber",    cat: "Transport",       amount: 320,  time: "Today",     emoji: "🚗", color: "#3b82f6" },
  { name: "Amazon",  cat: "Shopping",        amount: 1249, time: "Yesterday", emoji: "📦", color: "#f59e0b" },
  { name: "Swiggy",  cat: "Food & Dining",  amount: 450,  time: "Yesterday", emoji: "🍔", color: "#10b981" },
];

export default function TransactionList() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-5 h-full flex flex-col"
    >
      <h3 className="text-[14px] font-semibold text-white mb-4">Recent Transactions</h3>

      <div className="flex-1 space-y-1">
        {txns.map((tx, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.07 }}
            className="flex items-center justify-between py-2.5 px-2 rounded-xl hover:bg-white/[0.03] transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-[16px] flex-shrink-0"
                style={{ background: `${tx.color}14` }}
              >
                {tx.emoji}
              </div>
              <div>
                <p className="text-[13px] font-semibold text-[#cbd5e1] group-hover:text-white transition-colors">
                  {tx.name}
                </p>
                <p className="text-[11px] text-[#334155]">{tx.cat}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[13px] font-bold text-[#f87171]">
                − ₹{tx.amount.toLocaleString("en-IN")}
              </p>
              <p className="text-[10.5px] text-[#334155]">{tx.time}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button
        className="w-full mt-2 py-2 rounded-xl text-[12.5px] font-medium flex items-center justify-center gap-1.5 group transition-all text-[#475569] hover:text-[#a78bfa]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
      >
        View All Transactions
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}
