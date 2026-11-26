"use client";
import Sidebar from "@/components/common/Sidebar";
import Navbar from "@/components/common/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen bg-[#050816] flex items-center justify-center text-white">Loading Dashboard...</div>;
  }
  return (
    <div className="flex min-h-screen" style={{ background: "#020617" }}>
      <Sidebar />

      {/* Main area */}
      <div
        className="flex-1 flex flex-col relative"
        style={{ marginLeft: "272px", transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)" }}
      >
        {/* Dot grid background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            zIndex: 0,
          }}
        />
        {/* Ambient top-left glow */}
        <div
          className="fixed pointer-events-none"
          style={{
            top: "-200px",
            left: "0px",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)",
            zIndex: 0,
            filter: "blur(40px)",
          }}
        />
        {/* Ambient bottom-right glow */}
        <div
          className="fixed pointer-events-none"
          style={{
            bottom: "-100px",
            right: "0px",
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
            zIndex: 0,
            filter: "blur(40px)",
          }}
        />

        <div className="relative z-10 flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 p-6 xl:p-8">{children}</main>
        </div>

      </div>
    </div>
  );
}
