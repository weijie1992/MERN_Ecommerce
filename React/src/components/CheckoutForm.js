import React, { useState, useEffect } from "react";
//load Stripe.js script and initializes a Stripe Object, Pass the promise to element
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
//useStripe hook returns a reference to Stripe instance passed to the Elements provider.
//useElement hook safely pass the payment information collected by the Element to the Stripe API, access the component's underlying Element Instance so that we can use it with other Stripe.js method
//Element Provider allow us to use element components and access to the stripe object in any nested component.
import { createPaymentIntentFn } from "../functions/stripe";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";

//import "./CheckoutForm.css";
const cardStyle = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: "Arial, sans-serif",
      fontSmoothing: "antialiased",
      fontSize: "16px",
      "::placeholder": {
        color: "#32325d",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
};

const CheckoutForm = () => {
  //setup state for stripe element
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);
  const [clientSecret, setClientSecret] = useState("");
  const [totalPriceBeforeDiscount, setTotalPriceBeforeDiscount] = useState(0);
  const [stripe_customer_id, setStripe_customer_id] = useState("");
  //useStripe and useElements hook is to access to stripe Elements
  //this 2 method needs to be wrap in strip's Elements
  const stripe = useStripe();
  const elements = useElements();

  const { user } = useSelector((state) => {
    return { ...state };
  });

  const paymentIntent = async () => {
    try {
      const res = await createPaymentIntentFn(user.token);
      console.log(`RES from node!!:${res}`)
      setClientSecret(res.data.clientSecret);
      setTotalPriceBeforeDiscount(res.data.totalPriceBeforeDiscount);
      res.data.stripe_customer_id&&setStripe_customer_id(res.data.stripe_customer_id);
    } catch (err) {
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            const res3 = await createPaymentIntentFn(res2.data.token);
            setClientSecret(res3.data.clientSecret);
            setTotalPriceBeforeDiscount(res3.data.totalPriceBeforeDiscount);
          } catch (err) {
            setError(err.response.data.error);
          }
        }
      } else {
        setError(err.response.data.error);
      }
    }
  };

  //get payment intent
  useEffect(() => {
    paymentIntent();
  }, []);

  //listen on changes on card element
  const handleChange = (event) => {
    console.log(event);
    setDisabled(event.empty); //event.empty is true when page render
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    //make payment to stripe
    const payload = await stripe.confirmCardPayment(clientSecret, {
      // const payload = await stripe.confirmCardSetup(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)
      },
      //customer:stripe_customer_id,
      //setup_future_usage: "off_session", //save card details in paymentMethod object
    });
    console.log(payload);
    if (payload.error) {
      setError(`Payment failed ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
    }
  };
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div>Applied Promo Code : </div>
      <div>Price Before Discount : ${totalPriceBeforeDiscount}</div>
      <div>Price After Discount : (-)</div>
      <CardElement
        hidePostalCode={true}
        id="card-element"
        options={cardStyle}
        onChange={handleChange}
      />
      <button disabled={processing || disabled || succeeded}>
        <span id="button-text">
          {processing ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            "Pay now"
          )}
        </span>
      </button>
      {/* display error */}
      {error && (
        <div className="card-error" role="alert">
          {error}
        </div>
      )}
      {/* show success when payment completed */}
      <p className={succeeded ? "result-message" : "result-message hidden"}>
        Payment Success, see the result in your{" "}
        <Link to="/user/dashboard">Dashboard</Link>
      </p>
    </form>
  );
};

export default CheckoutForm;
