"use client";

import WelcomeHeader from "@/components/dashboard/WelcomeHeader";
import MarketOverview from "@/components/dashboard/MarketOverview";
import WatchlistWidget from "@/components/dashboard/WatchlistWidget";
import TopMovers from "@/components/dashboard/TopMovers";
import RecommendationCard from "@/components/dashboard/RecommendationCard";
import RecentAnalysis from "@/components/dashboard/RecentAnalysis";

export default function DashboardPage() {
  return (
    <div className="max-w-[1440px] mx-auto space-y-5">
      {/* Welcome & Investor Profile Banner */}
      <WelcomeHeader />

      {/* Row 1 — Live Market Indices */}
      <MarketOverview />

      {/* Row 2 — Watchlist + Top Movers */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-6" style={{ minHeight: "340px" }}>
          <WatchlistWidget />
        </div>
        <div className="col-span-12 xl:col-span-6" style={{ minHeight: "340px" }}>
          <TopMovers />
        </div>
      </div>

      {/* Row 3 — Personalized Recommendations + Recent Analysis */}
      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-12 xl:col-span-6" style={{ minHeight: "320px" }}>
          <RecommendationCard />
        </div>
        <div className="col-span-12 xl:col-span-6" style={{ minHeight: "320px" }}>
          <RecentAnalysis />
        </div>
      </div>
    </div>
  );
}
