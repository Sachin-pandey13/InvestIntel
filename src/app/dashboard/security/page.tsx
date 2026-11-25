"use client";
import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Smartphone, Monitor, Globe, Key, Clock, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SecurityPage() {
  const { user } = useAuth();
  
  // Mock data for demo purposes
  const securityScore = 92;
  const sessions = [
    { id: 1, device: "Windows PC", browser: "Chrome", location: "Mumbai, India", time: "Active Now", icon: Monitor, current: true },
    { id: 2, device: "iPhone 14 Pro", browser: "Safari", location: "Mumbai, India", time: "2 hours ago", icon: Smartphone, current: false },
    { id: 3, device: "Unknown Device", browser: "Firefox", location: "London, UK", time: "Yesterday", icon: Globe, current: false, suspicious: true },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Security Center</h1>
          <p className="text-sm text-[#94a3b8]">Manage your sessions, 2FA, and security score.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Security Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 flex flex-col items-center text-center relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#34d399]/10 rounded-full blur-[50px] pointer-events-none" />
          <h3 className="text-sm font-semibold text-[#94a3b8] self-start w-full text-left mb-6">Overall Security Score</h3>
          
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke="#34d399" 
                strokeWidth="8" 
                fill="none" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * securityScore) / 100} 
                strokeLinecap="round" 
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-white">{securityScore}</span>
              <span className="text-[10px] font-semibold text-[#34d399] tracking-wider uppercase">Excellent</span>
            </div>
          </div>
          
          <div className="space-y-3 w-full mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#34d399]" /> Password Strength</span>
              <span className="text-white font-medium">Strong</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8] flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#34d399]" /> Email Verified</span>
              <span className="text-white font-medium">Yes</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#94a3b8] flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-[#fbbf24]" /> 2FA Status</span>
              <span className="text-[#fbbf24] font-medium">Disabled</span>
            </div>
          </div>
        </motion.div>

        {/* Session Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Active Sessions</h3>
            <button className="text-xs font-semibold text-[#f87171] bg-[#f87171]/10 px-3 py-1.5 rounded-lg hover:bg-[#f87171]/20 transition-colors">
              Log Out All Devices
            </button>
          </div>
          
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${session.current ? 'bg-purple-500/20 text-purple-400' : session.suspicious ? 'bg-[#f87171]/20 text-[#f87171]' : 'bg-white/5 text-[#94a3b8]'}`}>
                    <session.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                      {session.device} - {session.browser}
                      {session.current && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-purple-500/20 text-purple-400 font-bold uppercase tracking-wider">This Device</span>}
                      {session.suspicious && <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-[#f87171]/20 text-[#f87171] font-bold uppercase tracking-wider">Suspicious</span>}
                    </h4>
                    <p className="text-xs text-[#64748b] mt-0.5">{session.location} • {session.time}</p>
                  </div>
                </div>
                {!session.current && (
                  <button className="text-[#64748b] hover:text-white transition-colors p-2">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* 2FA Setup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass p-6 lg:col-span-3 flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-purple-500"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
              <Key className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Two-Factor Authentication (2FA)</h3>
              <p className="text-sm text-[#94a3b8] max-w-xl">
                Add an extra layer of security to your account. We strongly recommend enabling Google Authenticator or Email OTP to prevent unauthorized access.
              </p>
            </div>
          </div>
          <button className="btn-primary whitespace-nowrap">
            Enable 2FA Now
          </button>
        </motion.div>

      </div>
    </div>
  );
}
