const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    interestedIn: { type: String },
    phoneNumber: { type: String },
    email: { type: String, required: true },
    message: { type: String },
    source: { type: String, enum: ["register-interest", "contact", "wishlist", "other"], default: "register-interest" },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property" },
    status: { type: String, enum: ["new", "contacted", "in-progress", "closed"], default: "new" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Lead", leadSchema);
