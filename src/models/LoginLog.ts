import mongoose from "mongoose";

const LoginLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ipAddress: { type: String, required: true },
    device: { type: String, required: true },
    location: { type: String, default: "Unknown" },
    status: { type: String, enum: ["Success", "Suspicious", "Failed"], default: "Success" },
  },
  { timestamps: true }
);

export default mongoose.models.LoginLog || mongoose.model("LoginLog", LoginLogSchema);
