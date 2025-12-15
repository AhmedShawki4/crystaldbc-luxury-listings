const mongoose = require("mongoose");

const investmentBoxSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    roiPercentage: { type: Number, default: 0 },
    minInvestmentAmount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvestmentBox", investmentBoxSchema);
