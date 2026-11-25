import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { encrypt } from "@/lib/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

function calculateHealthScore(data: any) {
  let score = 50; // Base score
  
  // Income vs Expenses
  if (data.income > 0) {
    const savingRate = (data.income - data.expenses) / data.income;
    if (savingRate >= 0.3) score += 20;
    else if (savingRate >= 0.1) score += 10;
    else if (savingRate < 0) score -= 20;
  }
  
  // Emergency Fund (Savings / Expenses)
  if (data.expenses > 0) {
    const monthsCovered = data.savings / data.expenses;
    if (monthsCovered >= 6) score += 15;
    else if (monthsCovered >= 3) score += 5;
    else score -= 10;
  }
  
  // EMI Burden (EMI / Income)
  if (data.income > 0 && data.emi > 0) {
    const emiRatio = data.emi / data.income;
    if (emiRatio > 0.4) score -= 15;
    else if (emiRatio <= 0.2) score += 5;
  }
  
  // Diversification
  if (data.investments && data.investments.length >= 3) score += 10;
  
  return Math.min(Math.max(Math.round(score), 10), 100);
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const body = await req.json();
    
    await connectDB();
    
    // Calculate health score based on RAW input before encryption
    const financialHealthScore = calculateHealthScore(body);
    
    // ENCRYPT SENSITIVE FIELDS BEFORE SAVING
    const encryptedData: Record<string, any> = {
      ...body,
      financialHealthScore,
      hasCompletedOnboarding: true,
    };
    if (body.pan !== undefined) encryptedData.pan = encrypt(body.pan);
    if (body.income !== undefined) encryptedData.income = encrypt(body.income.toString());
    if (body.expenses !== undefined) encryptedData.expenses = encrypt(body.expenses.toString());
    if (body.savings !== undefined) encryptedData.savings = encrypt(body.savings.toString());
    if (body.loans !== undefined) encryptedData.loans = encrypt(body.loans.toString());
    if (body.emi !== undefined) encryptedData.emi = encrypt(body.emi.toString());

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      encryptedData,
      { new: true }
    ).select("-password");

    return NextResponse.json({ success: true, financialHealthScore, user });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
