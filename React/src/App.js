import "./App.css";

//toast
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import CartModal from "./components/nav/CartModal";
import Home from "./pages/Home";
import Register from "./pages/Register";
import UserActivate from "./pages/UserActivate";
import Login from "./pages/Login";
import ForgetPassword from "./pages/ForgetPassword";
import ResetPassword from "./pages/ResetPassword";
import PurchaseHistory from "./pages/user/PurchaseHistory";
import Profile from "./pages/user/Profile";
import UpdatePassword from "./pages/user/UpdatePassword";
import Wishlist from "./pages/user/Wishlist";
import Checkout from "./pages/Checkout";
import PlaceOrder from "./pages/PlaceOrder";
import SubCategory from "./pages/SubCategory";

import Cart from "./pages/Cart";
import Search from "./pages/Search";

import ProductDetails from "./pages/ProductDetails";

//admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateCategory from "./pages/admin/CreateCategory";
import CreateSubCategory from "./pages/admin/CreateSubCategory";
import CreateProduct from "./pages/admin/CreateProduct";
import ViewAllProduct from "./pages/admin/ViewAllProducts";
import UpdateProduct from "./pages/admin/UpdateProduct";

import Header from "./components/nav/Header";
import Footer from "./components/Footer";
import UserRoute from "./components/privateRoutes/UserRoute";
import AdminRoute from "./components/privateRoutes/AdminRoute";
import { Switch, Route, BrowserRouter } from "react-router-dom";

import React, { Fragment, useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import setBearerToken from "./helper/setBearerToken";
// import {connect} from "react-redux";
// import {getState,subscribe} from "redux";

//functions
import { getUserCartOnLoginFn } from "./functions/cart";
import getRefreshToken from "./helper/getRefreshToken";
import { refreshTokenFn } from "./functions/auth";

const App = () => {
  const dispatch = useDispatch();
  console.log("app.js");
  //persist state when refresh was triggered
  const userCheck = () => {
    if (window !== "undefined") {
      if (localStorage.getItem("token") && localStorage.getItem("rfToken")) {
        const authToken = localStorage.getItem("token");
        const rfAuthToken = localStorage.getItem("rfToken");
        //set BearerToken
        setBearerToken(authToken);
        axios
          .get(`${process.env.REACT_APP_SERVER_API}/user`)
          .then((res) => {
            dispatch({
              type: "LOGGED_IN_USER",
              payload: res.data,
            });
            getUserCart(authToken); // retrieve user cart
          })
          .catch((err) => {
            //call refresh token
            axios
              .post(`${process.env.REACT_APP_SERVER_API}/refreshToken`, {
                refreshToken: rfAuthToken,
              })
              .then((res) => {
                dispatch({
                  type: "LOGGED_IN_USER",
                  payload: res.data,
                });
                getUserCart(authToken); // retrieve user cart
              })
              .catch((err) => {
                dispatch({
                  type: "LOGGED_OUT_USER",
                }); //end dispatch
              }); //end catch
          }); //end catch refresh token
      } //end token/rftoken exist
      else {
        dispatch({
          type: "LOGGED_OUT_USER",
        }); //end dispatch
      }
    } //end window undefined
  };

  const getUserCart = async (token) => {
    try {
      console.log("In getUserCart1");
      console.log(token);
      const res = await getUserCartOnLoginFn(token);
      console.log("In getUserCart2");
      console.log(res);
      dispatch({
        type: "GET_CART_ONMOUNT",
        payload: res.data,
      });
    } catch (err) {
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
            const res3 = await getUserCartOnLoginFn(res2.data.token);
            //add to redux store for Cart, CartModal and showModalProductReducer
            dispatch({
              type: "GET_CART_ONMOUNT",
              payload: res3.data,
            });
          } catch (err) {}
        }
      } else {
      }
    }
  };

  useEffect(() => {
    userCheck();
  }, [dispatch]);

  const DefaultContainer = () => {
    return (
      <>
        <Header />
        <CartModal />
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/register" component={Register} />
          <Route exact path="/user/activate/:token" component={UserActivate} />
          <Route exact path="/user/forgetPassword" component={ForgetPassword} />
          <Route
            exact
            path="/user/password/reset/:token"
            component={ResetPassword}
          />
          <Route exact path="/login" component={Login} />
          <Route exact path="/cart" component={Cart} />
          <Route exact path="/search" component={Search} />
          <Route exact path="/subcategory/:slug" component={SubCategory} />
          <Route
            exact
            path="/productDetails/:slug"
            component={ProductDetails}
          />
          <UserRoute
            exact
            path="/user/purchaseHistory"
            component={PurchaseHistory}
          />
          <UserRoute exact path="/user/profile" component={Profile} />
          <UserRoute
            exact
            path="/user/updatePassword"
            component={UpdatePassword}
          />
          <UserRoute exact path="/user/wishlist" component={Wishlist} />
          <AdminRoute
            exact
            path="/admin/dashboard"
            component={AdminDashboard}
          />
          <AdminRoute
            exact
            path="/admin/createCategory"
            component={CreateCategory}
          />
          <AdminRoute
            exact
            path="/admin/createSubCategory"
            component={CreateSubCategory}
          />
          <AdminRoute
            exact
            path="/admin/CreateProduct"
            component={CreateProduct}
          />
          <AdminRoute
            exact
            path="/admin/ViewAllProducts"
            component={ViewAllProduct}
          />
          <AdminRoute
            exact
            path="/admin/updateProduct/:slug"
            component={UpdateProduct}
          />
        </Switch>
        <Footer />
      </>
    );
  };
  return (
    <>
      <div className="container">
        <BrowserRouter>
        <ToastContainer />
          <Switch>
            <UserRoute exact path="/user/checkout" component={Checkout} />
            <UserRoute exact path="/user/PlaceOrder" component={PlaceOrder} />
            <Route component={DefaultContainer} />
          </Switch>
        </BrowserRouter>
      </div>
    </>
  );
};

export default App;
