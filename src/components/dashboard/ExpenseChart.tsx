"use client";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const data = [
  { name: "Housing",   value: 40, color: "#7c3aed" },
  { name: "Food",      value: 20, color: "#2563eb" },
  { name: "Transport", value: 15, color: "#06b6d4" },
  { name: "Shopping",  value: 15, color: "#059669" },
  { name: "Others",    value: 10, color: "#d97706" },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="text-[12px] font-semibold text-white">{payload[0].name}</p>
      <p className="text-[12px] text-[#94a3b8]">{payload[0].value}%</p>
    </div>
  );
};

export default function ExpenseChart() {
  const { user } = useAuth();
  const totalExpense = user?.expenses || 56430;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="glass p-5 h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[14px] font-semibold text-white">Expense Summary</h3>
        <button
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11.5px] text-[#475569] hover:text-[#94a3b8] transition-all"
          style={{ background: "rgba(255,255,255,0.04)" }}
        >
          This Month <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="flex items-center gap-5 flex-1">
        {/* Donut */}
        <div style={{ width: "130px", height: "130px", flexShrink: 0, position: "relative" }}>
          <ResponsiveContainer width={130} height={130}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={38}
                outerRadius={58}
                paddingAngle={2.5}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-[15px] font-bold text-white leading-none">₹{totalExpense.toLocaleString("en-IN")}</p>
            <p className="text-[9.5px] text-[#475569] mt-0.5">Total Spent</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2.5">
          {data.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: item.color }}
                />
                <span className="text-[12.5px] text-[#64748b]">{item.name}</span>
              </div>
              <span className="text-[12.5px] font-semibold text-[#94a3b8]">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
