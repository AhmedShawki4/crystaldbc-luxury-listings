const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    message: { type: String, required: true },
    page: { type: String, default: "contact" },
    status: { type: String, enum: ["new", "responded", "archived"], default: "new" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
