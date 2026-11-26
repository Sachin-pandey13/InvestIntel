"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { motion } from "framer-motion";
import { TrendingUp, ArrowRight, ShieldCheck, Zap, Lock, Mail, ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("analyst@investintel.com");
  const [password, setPassword] = useState("investintel2026");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        toast.success("Welcome to InvestIntel!");
        router.push("/dashboard");
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error("Network issue. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "analyst@investintel.com", password: "demo" }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        login(data.user);
        toast.success("Signed in as Demo Analyst");
        router.push("/dashboard");
      } else {
        toast.error("Demo login failed");
      }
    } catch {
      toast.error("Could not sign in with demo account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#F1F5F9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Toaster position="top-center" toastOptions={{ style: { background: "#0F172A", color: "#F1F5F9", border: "1px solid #1E293B" } }} />

      {/* Ambient background glows */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: 480,
          height: 480,
          background: "radial-gradient(circle, rgba(28,58,169,0.18) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "20%",
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(22,101,52,0.12) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#0B132B",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 16,
          padding: "36px 32px",
          position: "relative",
          zIndex: 10,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Back Link */}
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "#64748B",
            textDecoration: "none",
            marginBottom: 20,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#94A3B8")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#64748B")}
        >
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Brand header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "#1C3AA9",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TrendingUp size={20} color="#fff" strokeWidth={2.5} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#F1F5F9", letterSpacing: "-0.02em" }}>InvestIntel</h1>
            <p style={{ fontSize: 11, color: "#64748B" }}>Financial Analytics Platform</p>
          </div>
        </div>

        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>Sign In</h2>
        <p style={{ fontSize: 13.5, color: "#94A3B8", marginBottom: 20 }}>
          Access your portfolio analysis, live indicators, and market screener.
        </p>

        {/* Demo Mode Notice Banner */}
        <div
          style={{
            background: "rgba(28, 58, 169, 0.12)",
            border: "1px solid rgba(96, 165, 250, 0.25)",
            borderRadius: 10,
            padding: "12px 14px",
            marginBottom: 20,
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
          }}
        >
          <Zap size={16} color="#60A5FA" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 12, color: "#93C5FD", lineHeight: 1.5 }}>
            <strong>Demo Mode Active:</strong> You can click the quick demo button below or type any credentials to simulate an analyst session.
          </div>
        </div>

        {/* 1-Click Instant Demo Button */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "#1C3AA9",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 20,
            transition: "background 0.2s",
            boxShadow: "0 2px 8px rgba(28,58,169,0.3)",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1E3A8A")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = "#1C3AA9")}
        >
          <Zap size={15} />
          {loading ? "Signing in..." : "Instant Demo Sign In"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
          <span style={{ fontSize: 11, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em" }}>Or custom email</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255, 255, 255, 0.08)" }} />
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>
              Email Address
            </label>
            <div style={{ position: "relative" }}>
              <Mail size={15} color="#64748B" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 40px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#F1F5F9",
                  fontSize: 13.5,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#60A5FA")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#94A3B8", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <Lock size={15} color="#64748B" style={{ position: "absolute", left: 14, top: 14 }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 40px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  color: "#F1F5F9",
                  fontSize: 13.5,
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#60A5FA")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255, 255, 255, 0.1)")}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              background: "rgba(255, 255, 255, 0.08)",
              color: "#F1F5F9",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              marginTop: 6,
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.14)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#60A5FA";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255, 255, 255, 0.08)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255, 255, 255, 0.12)";
            }}
          >
            {loading ? "Authenticating..." : "Sign In With Credentials"}
            {!loading && <ArrowRight size={15} />}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#64748B" }}>
            Don't have an account?{" "}
            <Link href="/register" style={{ color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>

        <div
          style={{
            marginTop: 24,
            paddingTop: 16,
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            fontSize: 11.5,
            color: "#475569",
          }}
        >
          <ShieldCheck size={14} color="#166534" />
          <span>AES-256 Mocked Token Session &bull; Safe for portfolio demos</span>
        </div>
      </motion.div>
    </div>
  );
}
