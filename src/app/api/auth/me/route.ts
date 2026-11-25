import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/db";
import User from "@/models/User";
import { decrypt, maskPan, maskPhone } from "@/lib/encryption";

const JWT_SECRET = process.env.JWT_SECRET || "investintel-secret-key-2026";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    await connectDB();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const userObj = user.toObject();

    // Decrypt financial numbers for the UI (UI needs numbers for charts)
    const income = Number(decrypt(userObj.income)) || 0;
    const expenses = Number(decrypt(userObj.expenses)) || 0;
    const savings = Number(decrypt(userObj.savings)) || 0;
    const loans = Number(decrypt(userObj.loans)) || 0;
    const emi = Number(decrypt(userObj.emi)) || 0;

    return NextResponse.json({
      authenticated: true,
      user: {
        id: userObj._id,
        fullName: userObj.fullName,
        email: userObj.email,
        phone: maskPhone(userObj.phone), // MASKED
        pan: maskPan(decrypt(userObj.pan) ?? undefined), // DECRYPTED THEN MASKED
        hasCompletedOnboarding: userObj.hasCompletedOnboarding,
        financialHealthScore: userObj.financialHealthScore,
        income,
        expenses,
        savings,
        loans,
        emi,
        riskAppetite: userObj.riskAppetite,
        preferredInvestmentType: userObj.preferredInvestmentType,
        financialGoals: userObj.financialGoals,
        timeHorizon: userObj.timeHorizon,
        occupation: userObj.occupation,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
