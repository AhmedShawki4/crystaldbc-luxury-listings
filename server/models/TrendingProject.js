const mongoose = require("mongoose");

const trendingProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true },
    image: { type: String, required: true },
    status: { type: String, default: "Presale" },
    description: { type: String, required: true },
    amenities: [
      {
        name: { type: String, required: true },
      },
    ],
    completion: { type: String, required: true },
    startingPrice: { type: String, required: true },
    developer: { type: String, required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TrendingProject", trendingProjectSchema);
