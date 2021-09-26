import React, { useEffect, useState } from "react";

//load Stripe.js script and initializes a Stripe Object, Pass the promise to element
import { loadStripe } from "@stripe/stripe-js";
//useStripe hook returns a reference to Stripe instance passed to the Elements provider.
//useElement hook safely pass the payment information collected by the Element to the Stripe API, access the component's underlying Element Instance so that we can use it with other Stripe.js method
//Element Provider allow us to use element components and access to the stripe object in any nested component.
import {
  Elements
} from "@stripe/react-stripe-js";
import { Fragment } from "react";
import CheckoutForm from "../components/CheckoutForm";

//call load stripe outside of function as we do not want to recreate loadStripe object on every render.
const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PlaceOrder = () => {

  return (
    <Fragment>
      <Elements stripe={promise}>
          <CheckoutForm/>
      </Elements>
    </Fragment>
  );
};
export default PlaceOrder;
