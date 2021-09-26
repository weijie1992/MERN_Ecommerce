const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Cart = require("../models/Cart");
const User = require("../models/User");

exports.getPaymentMethodController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    //console.log(user);
    const { stripe_customer_id } = user;
    if (stripe_customer_id && stripe_customer_id.length > 0) {
      //retrieve paymentMethods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripe_customer_id,
        type: "card",
      });
      if (paymentMethods.data && paymentMethods.data.length > 0) {
        let filteredPaymentMethods = paymentMethods.data.map((pm) => {
          let filteredPM = {};
          filteredPM.id = pm.id;
          filteredPM.card = pm.card;
          return filteredPM;
        });
        console.log(filteredPaymentMethods);
        return res.json(filteredPaymentMethods);
      } else {
        return res.sendStatus(204);
      }
    } else {
      return res.sendStatus(204);
    }
  } catch (err) {
    console.error("checkCustomerPaymentMethod^stripe.User.findById:", err);
    return res.status(500).json({
      error: "Fail to retrieve user",
    });
  }
};

exports.addPaymentMethodController = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).exec();
    console.log(user);
    const { stripe_customer_id } = user;
    let customer;
    //customer exist
    if (stripe_customer_id && stripe_customer_id.length > 0) {
      //retrieve customer and send client secret
      try {
        customer = await stripe.customers.retrieve(stripe_customer_id);
        // console.log(customer);
      } catch (err) {
        console.error(
          "addPaymentMethodController^stripe.customers.retrieve:",
          err
        );
        return res.status(500).json({
          error: "Fail to retrieve stripe customer",
        });
      }
    }
    //customer does not exist
    else {
      //create a customer and send client secret
      try {
        customer = await stripe.customers.create();
      } catch (err) {
        console.error(
          "addPaymentMethodController^stripe.customers.create:",
          err
        );
        return res.status(500).json({
          error: "Fail to create stripe customer",
        });
      }
      console.log("customer:" + JSON.stringify(customer));
      //add stripe_customer_id to user
      user.stripe_customer_id = customer.id;
      user.save(async (err, savedUser) => {
        if (err) {
          console.error("addPaymentMethodController^user.save", err);
          return res.status(500).json({
            error: "Failed to save customer id",
          });
        }
      });
    }
    //create setupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customer.id,
    });
    return res.json({ clientSecret: setupIntent.client_secret });
  } catch (err) {
    console.error("addPaymentMethodController^stripe.User.findById:", err);
    return res.status(500).json({
      error: "Fail to retrieve user",
    });
  }
};

exports.deletePaymentMethodController = async (req, res) => {
  console.log(req.params.paymentMethodID);
  const paymentMethodID = req.params.paymentMethodID;
  if (paymentMethodID) {
    try {
      const user = await User.findById(req.user._id).exec();
      const { stripe_customer_id } = user;
      if (!stripe_customer_id || stripe_customer_id.length === 0) {
        console.error(
          "deletePaymentMethodController^User not found for delete"
        );
        return res.status(500).json({
          error: "Fail to retrieve customer id",
        });
      } else {
        //success
        console.log("here");
        const response = await stripe.paymentMethods.detach(paymentMethodID);
        return res.sendStatus(204);
      }
    } catch (err) {
      console.error(
        "deletePaymentMethodController^stripe.paymentMethods.detach",
        err
      );
      return res.status(500).json({
        error: "Fail to delete card",
      });
    }
  } else {
    console.error(
      "deletePaymentMethodController^delete cardID not pass by client"
    );
    return res.status(400).json({
      error: "Card ID not passed",
    });
  }
};

exports.createPaymentIntentController = async (req, res) => {
  const { paymentMethodID, addressID } = req.body;
  console.log(req.body);
  if ((!paymentMethodID, !addressID)) {
    //throw error
    console.error(
      "paymentIntentController^paymentMethodID and addressID not pass"
    );
    return res.status(400).json({
      error: "Fail to create paymentIntents",
    });
  }
  try {
    //get user cart
    const userCart = await Cart.findOne({
      userID: req.user._id,
    })
      .populate("userID", "name addresses stripe_customer_id")
      .exec();
    //validation, make sure address exists
    const { totalPriceBeforeDiscount, userID } = userCart;
    const { name, addresses, stripe_customer_id } = userID;
    console.log("totalPriceBeforeDiscount");
    console.log(totalPriceBeforeDiscount);
    console.log("userID");
    console.log(userID);
    console.log("name");
    console.log(name);
    console.log("addresses");
    console.log(addresses);
    console.log("stripe_customer_id");
    console.log(stripe_customer_id);
    //validate address
    if (addresses && addresses.length > 0) {
      const addressesID = addresses.map((address) => {
        return address._id;
      });
      if (!addressesID.includes(addressID)) {
        //throw error
        console.error("paymentIntentController^Fail to match address");
        return res.status(500).json({
          error: "Something is wrong with the address",
        });
      }
      //Create payment intent
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: totalPriceBeforeDiscount * 100,
          currency: "sgd",
          customer: stripe_customer_id,
          payment_method: paymentMethodID,
        });
        console.log("paymentIntent");
        console.log(paymentIntent);
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      } catch (err) {
        //throw error
        console.error(
          "paymentIntentController^stripe.paymentIntents.create",
          err
        );
        return res.status(500).json({
          error: "Fail to create paymentIntents",
        });
      }
    } else {
      //throw error
      console.error("paymentIntentController^No address exist");
      return res.status(500).json({
        error: "Something is wrong with the address",
      });
    }
  } catch (err) {
    //throw error
    console.error("paymentIntentController^stripe.userCart.findOne", err);
    return res.status(500).json({
      error: "Fail to create paymentIntents",
    });
  }
};
