const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const OrderSchema = new mongoose.Schema(
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
    deliveryAddress:String,
    totalPriceBeforeDiscount: Number,
    totalPriceAfterDiscount: Number,
    discountedPrice: Number,
    promoCode: {
      type: ObjectId,
      ref: "PromoCode",
    },
    paymentIntent: {},
    orderStatus: {
      type: String,
      default: "Payment Confirmed",
      enum: ["Payment Confirmed", "Delivering", "Completed", "Cancelled"],
    },
    userID: {
      type: ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
