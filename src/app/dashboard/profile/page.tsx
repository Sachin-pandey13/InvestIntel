"use client";
import { useState, useEffect } from "react";
import { UserCircle, Shield, Save, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [income, setIncome] = useState("");
  const [expenses, setExpenses] = useState("");
  const [savings, setSavings] = useState("");
  const [emi, setEmi] = useState("");
  const [riskAppetite, setRiskAppetite] = useState<"Low" | "Moderate" | "High">("Moderate");
  const [timeHorizon, setTimeHorizon] = useState<"Short-term" | "Mid-term" | "Long-term">("Long-term");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setIncome(String(user.income || ""));
      setExpenses(String(user.expenses || ""));
      setSavings(String(user.savings || ""));
      setEmi(String(user.emi || ""));
      setRiskAppetite(user.riskAppetite || "Moderate");
      setTimeHorizon(user.timeHorizon || "Long-term");
    }
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          income: Number(income) || 0,
          expenses: Number(expenses) || 0,
          savings: Number(savings) || 0,
          emi: Number(emi) || 0,
          riskAppetite,
          timeHorizon,
        }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        updateUser({
          income: Number(income) || 0,
          expenses: Number(expenses) || 0,
          savings: Number(savings) || 0,
          emi: Number(emi) || 0,
          riskAppetite,
          timeHorizon,
          financialHealthScore: json.financialHealthScore ?? user?.financialHealthScore,
        });
        toast.success("Investor profile updated! Stock scores will adapt automatically.");
      } else {
        toast.error(json.error || "Failed to update profile");
      }
    } catch {
      toast.error("Network error saving profile");
    } finally {
      setSaving(false);
    }
  };

  const monthlyBudget = Math.max(0, (Number(income) || 0) - (Number(expenses) || 0) - (Number(emi) || 0));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#f1f5f9] tracking-tight flex items-center gap-2.5">
          <UserCircle className="w-6 h-6 text-[#a78bfa]" />
          Investor Profile &amp; Financial Status
        </h1>
        <p className="text-sm text-[#64748b] mt-1">
          Your financial parameters directly calibrate the quantitative Stock Scoring Engine
        </p>
      </div>

      {/* Identity Summary */}
      <div className="glass p-5 rounded-2xl border border-white/[0.06] flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-base font-bold text-[#f1f5f9]">{user?.fullName}</p>
          <p className="text-xs text-[#64748b]">{user?.email} • PAN: {user?.pan || "Protected"}</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#34d399]/10 border border-[#34d399]/25 text-xs font-semibold text-[#34d399]">
          <Shield className="w-4 h-4" /> AES-256 Encrypted at Rest
        </div>
      </div>

      <form onSubmit={handleSave} className="glass p-6 rounded-2xl border border-white/[0.06] space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Monthly Income (₹)</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Monthly Expenses (₹)</label>
            <input
              type="number"
              value={expenses}
              onChange={(e) => setExpenses(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Current Savings (₹)</label>
            <input
              type="number"
              value={savings}
              onChange={(e) => setSavings(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Monthly EMI / Debt (₹)</label>
            <input
              type="number"
              value={emi}
              onChange={(e) => setEmi(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Risk Appetite</label>
            <select
              value={riskAppetite}
              onChange={(e) => setRiskAppetite(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            >
              <option value="Low">Low (Conservative / Dividend)</option>
              <option value="Moderate">Moderate (Balanced Growth)</option>
              <option value="High">High (Aggressive / Momentum)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#94a3b8] mb-1.5">Investment Horizon</label>
            <select
              value={timeHorizon}
              onChange={(e) => setTimeHorizon(e.target.value as any)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#0f172a] border border-white/[0.08] text-sm text-[#f1f5f9] focus:outline-none focus:border-[#a78bfa]"
            >
              <option value="Short-term">Short-term (&lt; 1 Year)</option>
              <option value="Mid-term">Mid-term (1–3 Years)</option>
              <option value="Long-term">Long-term (3+ Years)</option>
            </select>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[#7c3aed]/10 border border-[#7c3aed]/20 flex items-center justify-between">
          <span className="text-xs text-[#cbd5e1]">Calculated Monthly Investable Surplus</span>
          <span className="text-base font-bold text-[#a78bfa]">
            ₹{monthlyBudget.toLocaleString("en-IN")} / mo
          </span>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[#7c3aed] to-[#2563eb] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Financial Profile
        </button>
      </form>
    </div>
  );
}
