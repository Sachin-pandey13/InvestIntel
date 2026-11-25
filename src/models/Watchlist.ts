import mongoose from "mongoose";

const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      default: "",
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: "",
    },
    alertAbove: {
      type: Number,
      default: null,
    },
    alertBelow: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index: a user can only have each symbol once
WatchlistSchema.index({ userId: 1, symbol: 1 }, { unique: true });

export default mongoose.models.Watchlist ||
  mongoose.model("Watchlist", WatchlistSchema);
