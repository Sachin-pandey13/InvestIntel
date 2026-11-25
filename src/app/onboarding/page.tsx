"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, CheckCircle, IndianRupee, Shield, Target, Sparkles } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    occupation: "",
    pan: "",
    income: "",
    expenses: "",
    savings: "",
    loans: "0",
    emi: "0",
    riskAppetite: "Moderate",
    preferredInvestmentType: [] as string[],
    financialGoals: [] as string[],
    timeHorizon: "Long-term",
  });

  const handleNext = () => setStep((s) => Math.min(s + 1, 3));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));

  const toggleArrayItem = (field: "preferredInvestmentType" | "financialGoals", item: string) => {
    setFormData((prev) => {
      const current = prev[field];
      const updated = current.includes(item) ? current.filter((i) => i !== item) : [...current, item];
      return { ...prev, [field]: updated };
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        ...formData,
        income: Number(formData.income),
        expenses: Number(formData.expenses),
        savings: Number(formData.savings),
        loans: Number(formData.loans),
        emi: Number(formData.emi),
      };

      const res = await fetch("/api/user/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        updateUser({ hasCompletedOnboarding: true, ...data.user });
        toast.success("Profile generated successfully!");
        
        // Slight delay to allow context state to settle before routing
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        toast.error(data.error || "Failed to save profile");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { num: 1, title: "Personal Info", icon: Target },
    { num: 2, title: "Financials", icon: IndianRupee },
    { num: 3, title: "Goals", icon: Shield },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <Toaster position="top-center" toastOptions={{ style: { background: "#1e293b", color: "#fff" } }} />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[120px]" />

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white mb-2">Build Your Financial Profile</h1>
          <p className="text-[#94a3b8]">Help AI understand your current standing to give you tailored insights.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
          <motion.div
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 -z-10 -translate-y-1/2"
            initial={{ width: "0%" }}
            animate={{ width: `${((step - 1) / 2) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
          {steps.map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-[#050816] px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step >= s.num ? "border-purple-500 bg-purple-500/20 text-purple-400" : "border-white/10 bg-white/5 text-[#64748b]"
                }`}
              >
                {step > s.num ? <CheckCircle className="w-5 h-5 text-purple-400" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className={`text-xs font-semibold ${step >= s.num ? "text-white" : "text-[#64748b]"}`}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="glass p-8 min-h-[400px] flex flex-col mb-4">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 flex-1"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Tell us about yourself</h2>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Occupation</label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">PAN Number (Optional)</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50 uppercase"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 flex-1"
              >
                <h2 className="text-xl font-semibold text-white mb-4">Financial Overview</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={formData.income}
                      onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50"
                      placeholder="80000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Monthly Expenses (₹)</label>
                    <input
                      type="number"
                      value={formData.expenses}
                      onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50"
                      placeholder="35000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Total Savings (₹)</label>
                    <input
                      type="number"
                      value={formData.savings}
                      onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50"
                      placeholder="200000"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#94a3b8] mb-1.5">Total EMI / month (₹)</label>
                    <input
                      type="number"
                      value={formData.emi}
                      onChange={(e) => setFormData({ ...formData, emi: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white focus:border-purple-500/50"
                      placeholder="12000"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 flex-1"
              >
                <h2 className="text-xl font-semibold text-white mb-2">Goals & Preferences</h2>
                
                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-3">Risk Appetite</label>
                  <div className="flex gap-3">
                    {["Low", "Moderate", "High"].map((r) => (
                      <button
                        key={r}
                        onClick={() => setFormData({ ...formData, riskAppetite: r })}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          formData.riskAppetite === r
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "bg-white/[0.02] border-white/5 text-[#94a3b8] hover:bg-white/[0.05]"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-3">Investment Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {["Stocks", "SIP", "Mutual Funds", "FD", "Crypto", "Gold"].map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleArrayItem("preferredInvestmentType", t)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          formData.preferredInvestmentType.includes(t)
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                            : "bg-white/[0.02] border-white/5 text-[#94a3b8] hover:bg-white/[0.05]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#94a3b8] mb-3">Financial Goals</label>
                  <div className="flex flex-wrap gap-2">
                    {["Wealth Growth", "Emergency Fund", "House", "Retirement", "Business"].map((t) => (
                      <button
                        key={t}
                        onClick={() => toggleArrayItem("financialGoals", t)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          formData.financialGoals.includes(t)
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300"
                            : "bg-white/[0.02] border-white/5 text-[#94a3b8] hover:bg-white/[0.05]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
            <button
              onClick={handlePrev}
              disabled={step === 1 || loading}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                step === 1 ? "opacity-0 pointer-events-none" : "text-[#94a3b8] hover:bg-white/5 hover:text-white"
              }`}
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            
            {step < 3 ? (
              <button onClick={handleNext} className="btn-primary px-8">
                Next <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8">
                {loading ? "Analyzing Profile..." : "Complete Profile"} <Sparkles className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Privacy & Encryption Statement */}
        <div className="text-center mt-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-[#94a3b8]">
              Your financial data is encrypted and processed securely. Sensitive information is never shared externally.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
