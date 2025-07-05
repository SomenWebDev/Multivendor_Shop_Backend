const mongoose = require("mongoose");

const tempOrderSchema = new mongoose.Schema(
  {
    sessionId: { type: String, required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
        price: Number,
        vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
      },
    ],
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TempOrder", tempOrderSchema);
