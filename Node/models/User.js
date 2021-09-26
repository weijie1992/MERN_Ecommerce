const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;
//User Schema
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      trim: true,
      require: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
      require: true,
    },
    hashed_password: {
      type: String,
      require: true,
    },
    stripe_customer_id: String,
    role: {
      type: String,
      default: "normal",
    },
    addresses: [
      {
        buildingOrStreet: String,
        unitNo: String,
        country: String,
        city: String,
        postalCode: Number,
        contactNumber:String
      },
    ],
    wishlist: [
      {
        type: ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
