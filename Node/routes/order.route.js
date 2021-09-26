const express = require("express");
const router = express.Router();

//middleware -auth check
const {
  userAuthCheck,
  adminAuthCheck,
} = require("../middlewares/userAuthCheck");

//controller
const {
  createOrderController,
  getUserOrderController,
  userConfirmDeliveryController,
  adminGetUserOrderscontroller,
  adminUpdateOrderStatusController,
  adminSearchOrderStatusController,
} = require("../controllers/order.controller");

router.post("/createOrder", userAuthCheck, createOrderController);

router.get("/getUserOrder", userAuthCheck, getUserOrderController);

router.put(
  "/userConfirmDelivery/:orderID",
  userAuthCheck,
  userConfirmDeliveryController
);

router.get(
  "/adminGetUserOrder",
  userAuthCheck,
  adminAuthCheck,
  adminGetUserOrderscontroller
);

router.put(
  "/adminUpdateUserOrder/:orderID",
  userAuthCheck,
  adminAuthCheck,
  adminUpdateOrderStatusController
);

router.get(
  "/adminSearchOrderStatus",
  userAuthCheck,
  adminAuthCheck,
  adminSearchOrderStatusController
);
module.exports = router;
