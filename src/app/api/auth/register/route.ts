import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import connectDB from "@/lib/db";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { fullName, email, password, phone } = await req.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phone,
    });

    // Create token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });

    const response = NextResponse.json({
      success: true,
      user: { id: user._id, fullName: user.fullName, email: user.email, hasCompletedOnboarding: user.hasCompletedOnboarding },
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
    console.error("Registration error:", error);
    if (error.message && error.message.includes("buffering timed out") || error.name === "MongooseServerSelectionError") {
      return NextResponse.json({ error: "Database connection failed. Is MongoDB running?" }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
