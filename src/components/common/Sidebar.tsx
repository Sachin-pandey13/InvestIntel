"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import {
  LayoutDashboard, Search, BarChart3, GitCompareArrows,
  Star, Globe, Briefcase, UserCircle, TrendingUp,
  ChevronLeft, ChevronRight, Settings
} from "lucide-react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/screener", label: "Stock Screener", icon: Search },
  { href: "/dashboard/analyze", label: "Analyze", icon: BarChart3 },
  { href: "/dashboard/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/dashboard/watchlist", label: "Watchlist", icon: Star },
  { href: "/dashboard/market", label: "Market Overview", icon: Globe },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase },
  { href: "/dashboard/profile", label: "Profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className="fixed left-0 top-0 h-screen z-50 flex flex-col"
      style={{
        width: collapsed ? "68px" : "272px",
        background: "rgba(2,6,23,0.97)",
        borderRight: "1px solid rgba(255,255,255,0.05)",
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-[68px] border-b flex-shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg,#7c3aed,#2563eb)" }}>
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-[16px] font-bold tracking-tight whitespace-nowrap overflow-hidden">
            <span className="text-gradient-purple">Invest</span>
            <span className="text-white">Intel</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden px-3">
        {!collapsed && (
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#334155] mb-3 px-2">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center px-0" : ""}`}
                >
                  <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="flex-shrink-0 border-t px-3 py-3 space-y-0.5"
        style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        {!collapsed && (
          <Link href="#" className={`nav-item ${collapsed ? "justify-center px-0" : ""}`}>
            <Settings className="w-[18px] h-[18px] flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        )}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[#475569] hover:text-[#94a3b8] hover:bg-white/[0.03] transition-all text-xs font-medium"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
