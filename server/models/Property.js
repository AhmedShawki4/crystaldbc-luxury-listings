const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true },
    currencyCode: {
      type: String,
      enum: ["EGP", "SAR", "EUR", "AED", "RUB"],
      default: "EGP",
    },
    priceLabel: { type: String, required: true },
    priceValue: { type: Number, required: true },
    beds: { type: Number, required: true },
    baths: { type: Number, required: true },
    sqftLabel: { type: String, required: true },
    sqftValue: { type: Number, required: true },
    coverImage: { type: String, required: true },
    gallery: [{ type: String }],
    description: { type: String, required: true },
    features: [{ type: String }],
    type: { type: String, required: true },
    status: { type: String, required: true, default: "For Sale" },
    companyName: { type: String },
    rentPayPeriod: {
      type: String,
      enum: ["day", "month", "year"],
      default: "month",
    },
    isFeatured: { type: Boolean, default: false },
    isInvestable: { type: Boolean, default: false },
    minInvestmentAmount: { type: Number, default: 0 },
    roiPercentage: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
