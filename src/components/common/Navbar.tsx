"use client";
import { Search, Bell, Menu, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="h-20 border-b border-white/[0.04] px-6 xl:px-8 flex items-center justify-between sticky top-0 z-40 bg-[#050816]/80 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <button className="xl:hidden p-2 -ml-2 text-[#64748b] hover:text-white transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] border border-white/[0.05] rounded-full px-4 py-2 w-64 focus-within:border-[#7c3aed]/50 focus-within:bg-white/[0.05] transition-all">
          <Search className="w-4 h-4 text-[#64748b]" />
          <input
            type="text"
            placeholder="Search assets, tools..."
            className="bg-transparent border-none outline-none text-[13px] text-white w-full placeholder:text-[#64748b]"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-[#64748b] hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#f87171] border-2 border-[#050816]" />
        </button>
        <div className="h-8 w-px bg-white/[0.08]" />
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-[13px] font-semibold text-white">{user?.fullName || "Guest"}</p>
            <p className="text-[11px] text-[#34d399]">Verified</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#7c3aed] to-[#06b6d4] p-[2px]">
            <div className="w-full h-full rounded-full bg-[#050816] flex items-center justify-center">
              <span className="text-[13px] font-bold text-white">{user?.fullName?.charAt(0) || "U"}</span>
            </div>
          </div>
          <button onClick={logout} className="p-2 ml-1 text-[#64748b] hover:text-[#f87171] transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
