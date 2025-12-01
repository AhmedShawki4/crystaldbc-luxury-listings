const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    property: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
    note: { type: String },
  },
  { timestamps: true }
);

wishlistItemSchema.index({ user: 1, property: 1 }, { unique: true });

module.exports = mongoose.model("WishlistItem", wishlistItemSchema);
