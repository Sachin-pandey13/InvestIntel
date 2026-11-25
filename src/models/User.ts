import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    // Step 1: Personal Info
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    occupation: { type: String },
    pan: { type: String },

    // Step 2: Financial Profile (Encrypted Strings)
    income: { type: String, default: "" },
    expenses: { type: String, default: "" },
    savings: { type: String, default: "" },
    investments: { type: [String], default: [] },
    loans: { type: String, default: "" },
    emi: { type: String, default: "" },

    // Step 3: Preferences + Goals
    riskAppetite: { type: String, enum: ["Low", "Moderate", "High"], default: "Moderate" },
    preferredInvestmentType: { type: [String], default: [] },
    financialGoals: { type: [String], default: [] },
    timeHorizon: { type: String, enum: ["Short-term", "Mid-term", "Long-term"], default: "Long-term" },

    // Generated Info
    financialHealthScore: { type: Number, default: 0 },
    hasCompletedOnboarding: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
