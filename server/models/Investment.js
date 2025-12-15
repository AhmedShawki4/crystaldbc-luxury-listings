const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // New: invest in investment boxes instead of properties.
    investmentBox: { type: mongoose.Schema.Types.ObjectId, ref: "InvestmentBox" },
    // Legacy: kept for backward compatibility with existing documents.
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    investmentAmount: { type: Number, required: true },
    amountReceived: { type: Number, default: 0 },
    expectedProfit: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Not Paid", "Partially Paid", "Paid"],
      default: "Not Paid",
    },
    roiPercentage: { type: Number, default: 0 },
    notes: { type: String },
    increaseRequest: {
      additionalAmount: { type: Number },
      note: { type: String },
      status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
      },
      createdAt: { type: Date },
      reviewedAt: { type: Date },
      reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    payoutDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
