import React, { useState, useEffect } from "react";
//load Stripe.js script and initializes a Stripe Object, Pass the promise to element

//useStripe hook returns a reference to Stripe instance passed to the Elements provider.
//useElement hook safely pass the payment information collected by the Element to the Stripe API, access the component's underlying Element Instance so that we can use it with other Stripe.js method
//Element Provider allow us to use element components and access to the stripe object in any nested component.
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import {toast} from "react-toastify";

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

const StripeSetupIntentAddCard = ({
  handleCancelForAddCard,
  isAddNewCardModalVisible,
  clientSecretForPaymentMethod
}) => {
  console.log("222IN StripeSetupIntentAddCard isAddNewCardModalVisible: : " , isAddNewCardModalVisible)

   //clear card input if exist
   useEffect(()=> {
    console.log("###IN StripeSetupIntentAddCard isAddNewCardModalVisible: : " , isAddNewCardModalVisible);
    if(elements) {
      elements.getElement(CardElement).clear();
    }
  },[handleCancelForAddCard]);

  //setup state for stripe element
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState("");
  const [disabled, setDisabled] = useState(true);

  //useStripe and useElements hook is to access to stripe Elements
  //this 2 method needs to be wrap in strip's Elements
  const stripe = useStripe();
  const elements = useElements();
  
  //listen on changes on card element
  const handleChange = (event) => {
    console.log(event);
    setDisabled(event.empty); //event.empty is true when form is empty, nothing is filled
    setError(event.error ? event.error.message : "");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    console.log("HANDLESUBMITEEEEEEEEEEEEEEEEEEE")
    //make payment to stripe
    try {
      const payload = await stripe.confirmCardSetup(clientSecretForPaymentMethod, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });
      if(payload.error) {
        toast.error(payload.error.message);
      }
      console.log(payload);
      setProcessing(false);
      //set modal visible to false
      handleCancelForAddCard();
      //clear card element
      elements.getElement(CardElement).clear();
    } catch (err) {
      console.log(err);
      setProcessing(false);
      //set modal visible to false
      handleCancelForAddCard();
      //clear card element
      elements.getElement(CardElement).clear();
    }
  };
  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <CardElement
        hidePostalCode={true}
        id="card-element"
        options={cardStyle}
        onChange={handleChange}
      />
      <button
        disabled={processing || disabled || error}
        style={{
          backgroundColor: "#5469d4",
          fontFamily: "Arial, sans-serif",
          color: "#ffffff",
          borderRadius: "0 0 4px 4px",
          border: "0",
          padding: "12px 16px",
          fontSize: "16px",
          fontWeight: "600",
          cursor: "pointer",
          display: "block",
          transition: "all 0.2s ease",
          boxShadow: "0px 4px 5.5px 0px rgba(0, 0, 0, 0.07)",
          width: "100%",
          marginTop: "15px",
        }}
      >
        <span id="button-text">
          {processing ? (
            <div className="spinner" id="spinner"></div>
          ) : (
            "Add Card"
          )}
        </span>
      </button>
      {error && (
        <div className="card-error text-danger" role="alert">
          {error}
        </div>
      )}
    </form>
  );
};

export default StripeSetupIntentAddCard;
