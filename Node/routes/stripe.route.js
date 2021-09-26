const express = require("express");
const router = express.Router();

const {
  createPaymentIntentController,
  getPaymentMethodController,
  addPaymentMethodController,
  deletePaymentMethodController,
} = require("../controllers/stripe.controller.js");
//middleware - auth check
const { userAuthCheck } = require("../middlewares/userAuthCheck");

router.get("/getPaymentMethod", userAuthCheck, getPaymentMethodController);

router.get("/addPaymentMethod", userAuthCheck, addPaymentMethodController);

router.delete(
  "/deletePaymentMethodController/:paymentMethodID",
  userAuthCheck,
  deletePaymentMethodController
);

router.post("/createPaymentIntent", userAuthCheck, createPaymentIntentController);

module.exports = router;
