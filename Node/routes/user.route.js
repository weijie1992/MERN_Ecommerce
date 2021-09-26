const express = require("express");
const router = express.Router();


//middleware - auth check
const { userAuthCheck } = require("../middlewares/userAuthCheck");
const { updatePasswordValidator } = require("../middlewares/FormValidation");

//controller
const {
  userDashboardController,
  updatePasswordController,
  getUserInfoController,
  updateUserInfoController,
  getUserProfile
} = require("../controllers/user.controller");


router.put(
  "/user/updatePassword",
  updatePasswordValidator,
  userAuthCheck,
  updatePasswordController
);

router.get("/user/info", userAuthCheck, getUserInfoController);

router.put("/user/info", userAuthCheck, updateUserInfoController);

router.get("/user/userProfile",userAuthCheck, getUserProfile)
module.exports = router;
