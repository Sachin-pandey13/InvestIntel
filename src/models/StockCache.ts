import mongoose from "mongoose";

const StockCacheSchema = new mongoose.Schema({
  symbol: { type: String, required: true, unique: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  source: { type: String, required: true },
  lastUpdated: { type: Date, default: Date.now },
});

export default mongoose.models.StockCache || mongoose.model("StockCache", StockCacheSchema);
