const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const cartController = require("./cart.controller");
const sgMail = require("@sendgrid/mail");
const { update, findById } = require("../models/Cart");
const { json } = require("body-parser");
sgMail.setApiKey(process.env.SENDGRID_APIKEY);
const ObjectId = require("mongoose").Types.ObjectId;
const User = require("../models/User");

const decrementQuantityIncrementSoldSendEmailOnPaymentConfirmed = (
  newOrder
) => {
  console.log("!!!!!!!newOrder!!!!!!!!!!!!!!");
  console.log(newOrder);
  //deduct quantity
  const products = newOrder.products;

  const bulkProductsUpdate = products.map((p) => {
    console.log("***");
    console.log(p._id);
    console.log(p.purchaseQuantity);
    return {
      updateOne: {
        filter: { _id: p.product },
        update: {
          $inc: {
            availableQuantity: -p.purchaseQuantity,
            sold: +p.purchaseQuantity,
          },
        },
      },
    };
  });

  console.log("Before bulkProductsUpdate");
  console.log(bulkProductsUpdate);

  Product.bulkWrite(bulkProductsUpdate, {}).then((res) => {
    console.log("@@bulkProductsUpdate res");
    console.log(res);
  });

  newOrder.populate("userID userID.addresses:", (err, populatedResult) => {
    if (err) {
      console.error(
        "decrementQuantityIncrementSoldSendEmailOnPaymentConfirmed^populate",
        err
      );
    } else {
      console.log("!!!!!!!11233populatedResult");
      console.log(populatedResult);
      console.log("!!!!!!!ADDRESSES");
      console.log(populatedResult.userID.addresses);
      const filterAddress = populatedResult.userID.addresses.filter((a) => {
        console.log(a._id);
        console.log(populatedResult.deliveryAddress);
        return a._id == populatedResult.deliveryAddress;
      });
      console.log("!!!!!!!Final Address");
      console.log(filterAddress);
      console.log("!!!!!!!endFinal Address");

      const orderID = newOrder._id;
      const address = `${filterAddress[0].country}, ${filterAddress[0].city}, ${filterAddress[0].postalCode}, ${filterAddress[0].buildingOrStreet}, ${filterAddress[0].unitNo}`;
      const name = populatedResult.userID.name;
      const email = populatedResult.userID.email;
      const emailData = {
        from: process.env.EMAIL_FROM,
        to: email,
        Subject: `Hi ${name}, your order is confirmed! Order #${orderID}`,
        html: `
        <h1>Your order is confirmed!</h1>
        <p>You can view your order here ${process.env.CLIENT_URL}/user/purchaseHistory</p>
        <h2>Delivery Details</h2>
        <p>Name: ${name}</p>
        <p>Address: ${address}</p>
        <p>Phone: </p>
        <p>Email: ${email}</p>
        `,
      };
      sgMail.send(emailData).then(
        () => {
          return;
        },
        (error) => {
          console.error(
            "decrementQuantityIncrementSoldSendEmailOnPaymentConfirmed^SendGrid.send",
            error
          );
          return;
        }
      );
    }
  });
};

exports.createOrderController = async (req, res) => {
  console.log(req.body);
  if (req.body.paymentIntent && req.body.deliveryAddress) {
    try {
      console.log("******req.user._id ****");
      console.log(req.user._id);
      const cart = await Cart.findOne({ userID: req.user._id });
      const { products, totalPriceBeforeDiscount } = cart;
      if (cart && cart.products && cart.products.length > 0) {
        console.log("******cart****");
        console.log(cart);
        console.log("******paymentIntent****");
        console.log(req.body.paymentIntent);
        console.log("******deliveryAddress****");
        console.log(req.body.deliveryAddress);
        const newOrder = new Order({
          paymentIntent: req.body.paymentIntent,
          deliveryAddress: req.body.deliveryAddress,
          products: products,
          totalPriceBeforeDiscount: totalPriceBeforeDiscount,
          userID: req.user._id,
        });
        newOrder.save((err, order) => {
          if (err) {
            return res.status(500).json({
              error: "Order cannot be saved, please try again",
            });
          }
          //Successfully save order
          //send email
          decrementQuantityIncrementSoldSendEmailOnPaymentConfirmed(order);
          //decrement product quantity

          //empty cart
          cartController.emptyCartController(req, res);
        });
      } else {
        console.error(
          "createOrderController^cart && cart.products && cart.products.length < 0",
          err
        );
        return res.status(500).json({
          error: "User Cart is empty error",
        });
      }
    } catch (err) {
      console.error("createOrderController^Cart.findOne error", err);
      return res.status(500).json({
        error: "Database Server error please try again",
      });
    }
  } else {
    console.error("createOrderController^No paymentIntent found");
    return res.status(400).json({
      error: "paymentIntent Not Passed.",
    });
  }
};

exports.getUserOrderController = async (req, res) => {
  if (req.query.orderStatus) {
    const orderStatus =
      req.query.orderStatus == "all" ? null : req.query.orderStatus;
    const queryString =
      req.query.orderStatus == "all"
        ? { userID: req.user._id }
        : { userID: req.user._id, orderStatus };
    try {
      const orders = await Order.find(queryString)
        .populate("products.product")
        .sort({ updatedAt: -1 });
      console.log(orders);
      return res.json(orders);
    } catch (err) {
      console.error("getUserOrderController^ Order.findOne", err);
      return res.status(500).json({
        error: "Error, please select a status",
      });
    }
  } else {
    console.error("getUserOrderController^req.query.status not passed");
    return res.status(400).json({
      error: "Error, please select a status",
    });
  }
};

exports.userConfirmDeliveryController = async (req, res) => {
  if (req.params.orderID && req.body.orderStatus) {
    try {
      let updatedOrder = await Order.findByIdAndUpdate(
        req.params.orderID,
        { orderStatus: req.body.orderStatus },
        { new: true }
      );
      return res.json(updatedOrder);
    } catch (err) {
      console.error("userConfirmDelivery^Order.findByIdAndUpdate", err);
      return res.status(500).json({
        error: "Server Error please try again",
      });
    }
  } else {
    console.error("userConfirmDelivery^Order.request not parse correctly");
    return res.status(400).json({
      error: "Server Error please try again",
    });
  }
};

exports.adminGetUserOrderscontroller = async (req, res) => {
  try {
    const { orderID, userID } = req.query;
    let queryString = {};
    if (orderID && userID) {
      queryString = { _id: orderID, userID };
    } else if (orderID && !userID) {
      queryString = { _id: orderID };
    } else if (!orderID && userID) {
      queryString = { userID };
    }
    console.log(queryString);
    const orders = await Order.find(queryString)
      .populate("products.product")
      .sort({ updatedAt: -1 });
    return res.json(orders);
  } catch (err) {
    console.error("adminGetUserOrderscontroller^Order.find", err);
    return res.status(500).json({
      error: "Server Error",
    });
  }
};

exports.adminUpdateOrderStatusController = async (req, res) => {
  const orderID = req.params.orderID;
  const { orderStatus } = req.body;
  if (orderID && orderStatus) {
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderID,
        { orderStatus: orderStatus },
        { new: true }
      );
      return res.json(updatedOrder);
    } catch (err) {
      console.error("adminUpdateOrderStatusController^findByIdAndUpdate", err);
      return res.status(500).json({
        error: "Server Error please try again",
      });
    }
  } else {
    console.error(
      "adminUpdateOrderStatusController^orderID && orderStatus not passed"
    );
    return res.status(400).json({
      error: "Server Error please try again",
    });
  }
};

exports.adminSearchOrderStatusController = async (req, res) => {
  const { orderID, email } = req.query;
  
  if (orderID !== "") {
    //check if OrderID is valid Mongo Object ID
    if (ObjectId.isValid(orderID)) {
      try {
        const order = await Order.findById(orderID)
          .populate("products.product")
          .sort({ updatedAt: -1 });
        //convert Object to Array before response
        return res.json([order]);
      } catch (err) {
        console.error("adminSearchOrderStatusController^Orders.findById", err);
        return res.status(500).json({
          error: "Server Error",
        });
      }
    }
    //return empty array for invalid ObjectID
    else {
      return res.json([]);
    }
  } else if (email !== "") {
    try {
      const user = await User.findOne({ email });
      if (user) {
        try {
          const order = await Order.find({ userID: user._id })
            .populate("products.product")
            .sort({ updatedAt: -1 });
            return res.json(order);
        } catch (err) {
          console.error("adminSearchOrderStatusController^Orders.find", err);
          return res.status(500).json({
            error: "Server Error",
          });
        }
      } 
      //return empty array for user dont exist
      else {
        return res.json([]);
      }
    } catch (err) {
      console.error("adminSearchOrderStatusController^User.findOne", err);
      return res.status(500).json({
        error: "Server Error",
      });
    }
  }
};
