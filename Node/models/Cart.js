const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const CartSchema = new mongoose.Schema(
  {
    products: [
      {
        product: {
          type: ObjectId,
          ref: "Product",
        },
        purchaseQuantity: Number,
        totalPriceWithQuantity: Number,
      },
    ],
    totalPriceBeforeDiscount: Number,
    totalPriceAfterDiscount: Number,
    discountedPrice: Number,
    promoCode: {
      type: ObjectId,
      ref: "PromoCode",
    },
    userID: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", CartSchema);
