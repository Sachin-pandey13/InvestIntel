import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import connectDB from "@/lib/db";
import User from "@/models/User";
import LoginLog from "@/models/LoginLog";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

// In-memory rate limiter for demo purposes
// In production, use Redis for distributed rate limiting
const loginAttempts = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";
    
    // Rate Limiting Check
    const now = Date.now();
    const attempts = loginAttempts.get(ipAddress);
    if (attempts && now < attempts.resetTime) {
      if (attempts.count >= 5) {
        return NextResponse.json(
          { error: "Too many login attempts. Please try again in 15 minutes." },
          { status: 429 }
        );
      }
    } else if (attempts && now > attempts.resetTime) {
      // Reset after timeout
      loginAttempts.delete(ipAddress);
    }

    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Record failed attempt
      recordFailedAttempt(ipAddress, now);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Record failed attempt
      recordFailedAttempt(ipAddress, now);
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Success - clear failed attempts
    loginAttempts.delete(ipAddress);

    // Determine login anomaly (demo logic: random unknown device)
    const userAgent = req.headers.get("user-agent") || "Unknown Device";
    const isSuspicious = Math.random() > 0.8; // 20% chance to flag as suspicious for demo

    await LoginLog.create({
      userId: user._id,
      ipAddress,
      device: userAgent,
      status: isSuspicious ? "Suspicious" : "Success",
    });

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        hasCompletedOnboarding: user.hasCompletedOnboarding,
        financialHealthScore: user.financialHealthScore
      },
    });

    response.headers.set(
      "Set-Cookie",
      serialize("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
      })
    );

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.message && error.message.includes("buffering timed out") || error.name === "MongooseServerSelectionError") {
      return NextResponse.json({ error: "Database connection failed. Is MongoDB running?" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Helper to record failed attempts
function recordFailedAttempt(ip: string, now: number) {
  const current = loginAttempts.get(ip) || { count: 0, resetTime: now + 15 * 60 * 1000 }; // 15 min lock
  current.count += 1;
  loginAttempts.set(ip, current);
}
