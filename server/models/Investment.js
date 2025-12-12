const mongoose = require("mongoose");

const investmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
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
    payoutDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Investment", investmentSchema);
