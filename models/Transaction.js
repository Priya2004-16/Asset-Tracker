// models/Transaction.js
const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  assetId: { type: String, required: true, index: true },
  lab: { type: String, required: true },
  dept: { type: String, required: true },
  action: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  timestamp: { type: Date, default: () => new Date() },
  previousHash: { type: String, required: true },
  currentHash: { type: String, required: true, unique: true },
}, { timestamps: true });

// Optional compound index to prevent duplicate "Added" entries for same asset in same lab:
transactionSchema.index({ assetId: 1, lab: 1, action: 1 }, { unique: false });

module.exports = mongoose.model("Transaction", transactionSchema);
