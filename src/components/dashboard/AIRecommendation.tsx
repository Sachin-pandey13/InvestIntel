"use client";
import { motion } from "framer-motion";
import { TrendingUp, Sparkles, ArrowRight } from "lucide-react";

export default function AIRecommendation() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white flex items-center gap-2">
          AI Investment Recommendation
          <Sparkles className="w-3.5 h-3.5 text-[#a78bfa]" />
        </h3>
        <Info />
      </div>

      {/* Card */}
      <div
        className="flex-1 rounded-xl p-4 flex flex-col gap-4"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.1) 0%, rgba(6,182,212,0.06) 100%)",
          border: "1px solid rgba(124,58,237,0.12)",
        }}
      >
        {/* Badge */}
        <div className="badge badge-success self-start">
          <TrendingUp className="w-3 h-3" /> High Potential
        </div>

        {/* Stock */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[22px] font-bold text-white tracking-tight">ICICI Bank</p>
            <p
              className="text-[13px] font-bold mt-0.5"
              style={{ color: "#34d399" }}
            >
              BUY
            </p>
          </div>
          {/* Crystal visual */}
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(37,99,235,0.25), rgba(6,182,212,0.15))",
              border: "1px solid rgba(96,165,250,0.2)",
            }}
          >
            <div
              className="w-8 h-8 rounded-lg animate-pulse"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #06b6d4)",
                boxShadow: "0 0 20px rgba(6,182,212,0.4)",
              }}
            />
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Target Price", value: "₹1,245" },
            { label: "Potential Upside", value: "+18.7%", accent: "#34d399" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg p-2.5"
              style={{ background: "rgba(255,255,255,0.04)" }}
            >
              <p className="text-[10.5px] text-[#475569]">{item.label}</p>
              <p
                className="text-[14px] font-bold mt-0.5"
                style={{ color: item.accent ?? "#f1f5f9" }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between mb-1.5">
            <p className="text-[11px] text-[#475569]">Confidence</p>
            <p className="text-[11px] font-semibold text-[#a78bfa]">88%</p>
          </div>
          <div className="progress-track">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: "88%" }}
              transition={{ duration: 1.4, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* CTA */}
      <button
        className="w-full mt-3 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 group transition-all"
        style={{
          background: "rgba(124,58,237,0.1)",
          border: "1px solid rgba(124,58,237,0.15)",
          color: "#a78bfa",
        }}
      >
        View Full Analysis
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </motion.div>
  );
}

function Info() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-3.5 h-3.5 text-[#334155]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}
