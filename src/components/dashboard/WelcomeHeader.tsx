"use client";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function WelcomeHeader() {
  const { user } = useAuth();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div>
        <h1 className="text-[26px] font-bold tracking-tight text-white mb-1">
          Welcome back, <span className="text-gradient">{user?.fullName?.split(" ")[0] || "User"}</span>
        </h1>
        <p className="text-[14px] text-[#475569]">
          Here is what's happening with your finances today.
        </p>
      </div>

      {/* Financial Health Score Badge */}
      <div className="flex items-center gap-3 glass px-4 py-2 rounded-xl">
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#34d399]/10 border border-[#34d399]/20">
          <ShieldCheck className="w-5 h-5 text-[#34d399]" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-[#64748b] leading-tight">Financial Health</p>
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] font-bold text-white leading-none">{user?.financialHealthScore || "--"}</span>
            <span className="text-[10px] text-[#34d399] font-bold">/100</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
