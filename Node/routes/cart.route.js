const express = require("express");
const router = express.Router();

//middleware - auth check
const { userAuthCheck } = require("../middlewares/userAuthCheck");

//controller
const {
  addCartBeforeLoginController,
  getUserCartOnLoginController,
  deleteSingleCartItemController,
  addToCartController,
  updateCartQuantityController,
  getUserCartOnCheckoutController,
  emptyCartController
} = require("../controllers/cart.controller");

router.post(
  "/user/addCartBeforeLogin",
  userAuthCheck,
  addCartBeforeLoginController
);

router.get(
  "/user/getUserCartOnLogin",
  userAuthCheck,
  getUserCartOnLoginController
);

router.delete(
  "/user/cart/:productID",
  userAuthCheck,
  deleteSingleCartItemController
);

router.post("/user/cart", userAuthCheck, addToCartController);

router.put("/user/cart", userAuthCheck, updateCartQuantityController);

router.post(
  "/user/getUserCartOnCheckout",
  userAuthCheck,
  getUserCartOnCheckoutController
);

router.delete("/user/emptyCart",userAuthCheck,emptyCartController)

module.exports = router;
