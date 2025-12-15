const mongoose = require("mongoose");

const rentalRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Declined"],
      default: "Pending",
    },
    payPeriod: {
      type: String,
      enum: ["day", "month", "year"],
      default: "month",
    },
    priceValue: { type: Number, default: 0 },
    startDate: { type: Date },
    dueDate: { type: Date },
    endDate: { type: Date },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

rentalRequestSchema.index({ user: 1, property: 1, status: 1 });

module.exports = mongoose.model("RentalRequest", rentalRequestSchema);
