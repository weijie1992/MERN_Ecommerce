const { validationResult } = require("express-validator");
const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken");
const sgMail = require("@sendgrid/mail");
const bcrypt = require("bcrypt");
const { update } = require("../models/User");
sgMail.setApiKey(process.env.SENDGRID_APIKEY);
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

exports.updatePasswordController = async (req, res) => {
  const { currentPassword, updatedPassword } = req.body;

  if (currentPassword && updatedPassword) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array().map((error) => error.msg);
      return res.status(422).json({
        error: firstError,
      });
    } else {
      console.log("****1");
      User.findById(req.user._id, async (err, user) => {
        if (err || !user) {
          console.error(
            "updatePasswordController^findById_error or no user:",
            err
          );
          return res.status(401).json({
            error: "Fail to update your account. Please sign up again",
          });
        } else {
          console.log("****2");
          //Decrypt password
          try {
            console.log("****3");
            if (await bcrypt.compare(currentPassword, user.hashed_password)) {
              console.log("****5");
              //hash new password
              const salt = await bcrypt.genSalt();
              const updated_hashed_password = await bcrypt.hash(
                updatedPassword,
                salt
              );
              user.hashed_password = updated_hashed_password;
              user.save((err, updatedUser) => {
                if (err) {
                  console.error(
                    "updatePasswordController^bcrypt.compare:",
                    err
                  );
                  return res.status(500).json({
                    error: "Fail to update your password please try again",
                  });
                } else {
                  console.log("****4");
                  return res.json({
                    message: "Password Updated Successfully",
                  });
                }
              });
            } // end await brypt
            else {
              console.log("****7");
              console.error("updatePasswordController^bcrypt.compare:", err);
              return res.status(401).json({
                error:
                  "Current password is incorrect please logout and click on forget password",
              });
            }
          } catch (err) {
            //end try
            console.log("****6");
            console.error("updatePasswordController^bcrypt.compare:", err);
            return res.status(401).json({
              error:
                "Current password is incorrect please logout and click on forget password",
            });
          } //end catch bycryt
        } //end Else User.findById
      }); //end User.findById
    } //end else no error
  } else {
    console.error(
      "updatePasswordController^token / currentPassword / password not pass by Client"
    );
    return res.status(401).json({
      error: "Unauthorized",
    });
  } //end token && currentPassword && password
};

exports.getUserInfoController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("name addresses")
      .exec();
    if (user) {
      return res.json(user);
    } else {
      console.error("getUserInfo^No user found");
      return res.status(400).json({
        error: "Internal Error please try again",
      });
    }
  } catch (err) {
    console.error("getUserInfo^User.findById:", err);
    return res.status(401).json({
      error: "Internal Error please try again",
    });
  }
};

exports.updateUserInfoController = async (req, res) => {
  console.log(req.body.updatedUserInfo);
  if (req.body.updatedUserInfo) {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        req.body.updatedUserInfo,
        { new: true }
      )
        .select("name email addresses wishlist -_id")
        .exec();
      if (updatedUser) {
        return res.json(updatedUser);
      }
      console.error("addUserInfoController^User.findByIdAndUpdate:", err);
      return res.status(500).json({
        error: "Error Updating User please try again",
      });
    } catch (err) {
      console.error("addUserInfoController^User.findByIdAndUpdate:", err);
      return res.status(500).json({
        error: "Internal Error please try again",
      });
    }
  } else {
    console.error("addUserInfoController, No user passed");
    return res.status(400).json({
      error: "Error Updating User please try again",
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("email name addresses stripe_customer_id")
      .exec();
    //console.log(user);
    if (user) {
      //Copy user to update object
      let updatedUser = JSON.parse(JSON.stringify(user));
      let cardsLast4 = [];
      //get customer card info
      if (user.stripe_customer_id && user.stripe_customer_id.length > 0) {
        try {
          //retrieve paymentMethods
          const paymentMethods = await stripe.paymentMethods.list({
            customer: user.stripe_customer_id,
            type: "card",
          });
          // console.log(paymentMethods);
          cardsLast4 = paymentMethods.data.map((d) => {
            return d.card.last4;
          });
        } catch (err) {
          console.error(
            "addPaymentMethodController^stripe.customers.retrieve:",
            err
          );
        }
      }
      delete updatedUser.stripe_customer_id;
      updatedUser.cardsLast4 = cardsLast4.length > 0 ? cardsLast4 : undefined;
      return res.json(updatedUser);
    } else {
      console.error("getUserProfile^No user found");
      return res.status(500).json({
        error: "Internal Error please try again",
      });
    }
  } catch (err) {
    console.error("getUserProfile^User.findById:", err);
    return res.status(500).json({
      error: "Internal Error please try again",
    });
  }
};
