import mongoose from "mongoose";

const AnalysisHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["single", "comparison", "screener"],
      required: true,
    },
    symbols: {
      type: [String],
      default: [],
    },
    scores: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for fast lookup by user, sorted by most recent
AnalysisHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.AnalysisHistory ||
  mongoose.model("AnalysisHistory", AnalysisHistorySchema);
