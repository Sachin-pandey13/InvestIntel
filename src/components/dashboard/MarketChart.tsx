"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { Info, RefreshCw } from "lucide-react";

const indicesMap = [
  { name: "NIFTY 50", symbol: "^NSEI" },
  { name: "SENSEX", symbol: "^BSESN" },
  { name: "NASDAQ", symbol: "^IXIC" },
  { name: "S&P 500", symbol: "^GSPC" }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-[11px] text-[#475569] mb-1">{label}</p>
      <p className="text-[14px] font-bold text-[#34d399]">
        {payload[0].value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function MarketChart() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const symbol = indicesMap[activeIdx].symbol;
        const res = await fetch(`/api/stocks/market?symbol=${symbol}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error("Failed to fetch chart data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // Refresh data every 3 minutes
    const interval = setInterval(fetchData, 180000);
    return () => clearInterval(interval);
  }, [activeIdx]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[14px] font-semibold text-white">Live Market Overview</h3>
          <span className="flex items-center gap-1 text-[10px] text-[#34d399] bg-[#34d399]/10 px-2 py-0.5 rounded-full border border-[#34d399]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34d399] animate-pulse" />
            LIVE
          </span>
        </div>
      </div>

      {/* Index tabs */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {indicesMap.map((idx, i) => (
          <button
            key={idx.name}
            onClick={() => setActiveIdx(i)}
            disabled={loading}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap"
            style={{
              background: activeIdx === i ? "rgba(124,58,237,0.15)" : "transparent",
              color: activeIdx === i ? "#a78bfa" : "#475569",
              opacity: loading && activeIdx !== i ? 0.5 : 1
            }}
          >
            {idx.name}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[220px]">
          <RefreshCw className="w-6 h-6 text-[#a78bfa] animate-spin mb-2" />
          <span className="text-xs text-[#94a3b8]">Fetching live data...</span>
        </div>
      ) : data ? (
        <>
          {/* Value */}
          <div className="mb-4">
            <p className="text-[26px] font-bold text-white tracking-tight">
              {data.price?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-[13px] font-semibold mt-0.5" style={{ color: data.change >= 0 ? "#34d399" : "#f87171" }}>
              {data.change >= 0 ? "+" : ""}{data.changePercent?.toFixed(2)}% ({data.change >= 0 ? "+" : ""}{data.change?.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
            </p>
          </div>

          {/* Chart */}
          <div style={{ height: "180px", width: "100%", flex: 1 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chart}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={data.change >= 0 ? "#34d399" : "#f87171"} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={data.change >= 0 ? "#34d399" : "#f87171"} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.04)" vertical={false} />
                <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} minTickGap={20} />
                <YAxis hide domain={["dataMin - 100", "dataMax + 100"]} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={data.change >= 0 ? "#34d399" : "#f87171"}
                  strokeWidth={2}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 4, fill: data.change >= 0 ? "#34d399" : "#f87171", stroke: "#020617", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-xs text-[#f87171]">Market Data Unavailable</span>
        </div>
      )}
    </motion.div>
  );
}
