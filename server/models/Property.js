const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true },
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
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Property", propertySchema);
