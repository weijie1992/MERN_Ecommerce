import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { createPaymentIntentFn } from "../functions/stripe";
import { createOrderFn } from "../functions/order";
import { useStripe } from "@stripe/react-stripe-js";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";
import {toast} from "react-toastify";


const DisplayOrderSummary = ({
  promoCode,
  totalPriceBeforeDiscount,
  discountedPrice,
  user,
  cart,
  chosenAddress,
  chosenPaymentMethod,
  totalPriceAfterDiscount,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  //initiate stripe
  const stripe = useStripe();
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    try {
      //get Payment intent secret from server
      const res = await createPaymentIntentFn(
        user.token,
        chosenPaymentMethod,
        chosenAddress
      );

      //make confirm card payment request to stripe server
      stripe
        .confirmCardPayment(res.data.clientSecret)
        .then(async (paymentIntent) => {
          console.log("confirmCardPayment Result");
          console.log(paymentIntent);
          if (paymentIntent.error) {
            //send error to server redirect to error page
            toast.error(paymentIntent.error.message);
          } else {
            //send payment intent response to server
            try {
              const res = await createOrderFn(paymentIntent,chosenAddress,user.token);
              if (res.status === 201) {
                //empty cart from redux
                dispatch({
                  type: "EMPTY_CART_AFTER_SUCCESSFUL_PURCHASE",
                });
                //redirect to success page
                history.push("/user/purchaseHistory");
              }
            } catch (err) {
              console.log("2222222222223asdd")
              if (err.response.data.error === "J01") {
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken) {
                  try {
                    const res2 = await refreshTokenFn(rfAuthToken);
                    //update redux state
                    dispatch({
                      type: "REFRESH_TOKEN",
                      payload: res2.data,
                    });
                    const res3 = await createOrderFn(paymentIntent,chosenAddress,user.token);
                    if (res3.status === 201) {
                      //empty cart from redux
                      dispatch({
                        type: "EMPTY_CART_AFTER_SUCCESSFUL_PURCHASE",
                      });
                      //redirect to success page
                      history.push("/user/purchaseHistory");
                    }
                  } catch (err) {
                    // todo set error
                  }
                }
              } else {
                //fail not because of auth token
                console.log("111223asdd")
                toast.error(err.response.data.error);
              }
            }
          }
        });
    } catch (err) {
      // todo set error
    }
  };

  return (
    <form onSubmit={handlePlaceOrder}>
      <div className="border p-3">
        <div className="row pb-2">
          <h4 className="col">Order Summary</h4>
        </div>
        <div className="row mb-1 mr-1">
          <div className="col font-italic">Promo Code Applied : </div>
          <div className="ml-auto font-italic">{promoCode || "No Code"}</div>
        </div>
        <hr />
        <div className="row mb-1 mr-1">
          <div className="col">Items Total : </div>
          <div className="ml-auto">SGD${totalPriceBeforeDiscount&&totalPriceBeforeDiscount.toFixed(2)}</div>
        </div>
        <div className="row mr-1 ">
          <div className="col">Discounts:</div>
          <div className="ml-auto">
            <div className="text-danger">-SGD${(discountedPrice&&discountedPrice.toFixed(2)) || 0}</div>
          </div>
        </div>
        <hr />
        <div className="row mb-1 mr-1">
          <div className="col">Total Payable</div>
          <div className="ml-auto ">
            SGD${(totalPriceAfterDiscount || totalPriceBeforeDiscount).toFixed(2)}
          </div>
        </div>
        <div className="row mt-3">
          <div className="col">
            {user && user.email && user.token && (
              <button
                className="btn btn-warning w-100 mr-auto ml-auto text-light"
                disabled={
                  !(
                    cart.products.length > 0 &&
                    chosenAddress !== "" &&
                    chosenPaymentMethod !== ""
                  )
                }
              >
                Place Order
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
};

export default DisplayOrderSummary;
