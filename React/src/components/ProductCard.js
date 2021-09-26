import React from "react";
import { MDBIcon } from "mdbreact";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { addToCartFn } from "../functions/cart";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";

const ProductCard = ({ handleDelete, products, user }) => {
  const dispatch = useDispatch();
  const card = () => {
    return (
      <div className="row">
        {products.map((p) => {
          console.log(p);
          return (
            <div
              className="col-md-3 mb-3 d-flex align-items-stretch"
              key={p._id}
            >
              {/* <div className="card" style={{ height: "26rem" }}> */}
              <div className="card">
                <div className="view overlay">
                  {/* <div> */}
                  {/* image here */}
                  <Link to={`/productDetails/${p.slug}`}>
                    <img
                      // style={{ height: '10rem' }}
                      src={`${process.env.REACT_APP_AWSS3DIR}/${p.images[0]}`}
                      style={{ height: "15rem", objectFit: "cover" }}
                      className="card-img-top"
                      alt=""
                    ></img>
                  </Link>
                  <div className="card-body">
                    <div className="font-weight-bolder">{p.name}</div>
                    <div className="deep-orange-text">
                      ${p.price.toFixed(2)}
                    </div>
                    <div
                      className="font-weight-light"
                      style={{ fontSize: "12px" }}
                    >
                      {p.description && p.description.length > 30
                        ? `${p.description.substring(0, 25)}...`
                        : p.description}
                    </div>
                    <div className="mt-1">
                      {/* <span className="float-left mr-2 block">
                        <MDBIcon far icon="heart" />
                      </span> */}
                      {/* <span className="block ml-3">
                        <MDBIcon far icon="star" />
                        <MDBIcon far icon="star" />
                        <MDBIcon far icon="star" />
                        <MDBIcon far icon="star" />
                        <MDBIcon far icon="star" />
                      </span> */}
                      <span
                        className="float-right block mt-1"
                        style={{ fontSize: "13px" }}
                      >
                        {p.sold} sold
                      </span>
                    </div>
                    {user && user.role == "admin" && (
                      <div className="mt-1">
                        <MDBIcon
                          onClick={() => handleDelete(p.slug)}
                          className="float-right pt-1 text-danger"
                          style={{ cursor: "pointer" }}
                          far
                          icon="trash-alt"
                        />

                        <Link to={`/admin/updateProduct/${p.slug}`}>
                          <MDBIcon
                            className="float-right pt-1 pr-3 text-warning"
                            style={{ cursor: "pointer" }}
                            far
                            icon="edit"
                            // onClick={() => handleEdit(p.slug)}
                          />
                        </Link>
                      </div>
                    )}
                  </div>
                  {p.availableQuantity && p.availableQuantity > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleAddToCart(p)}
                      className="d-block w-100 btn-warning"
                    >
                      <MDBIcon icon="cart-plus" />
                      Add To Cart
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={true}
                      className="d-block w-100 btn-warning"
                    >
                      Sold Out
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  //if user logged in add to DB, else add to local storage
  const handleAddToCart = async (product) => {
    if (typeof window !== "undefined") {
      //check window object
      if (user && user.email && user.token) {
        //user logged in
        let productReq = {};
        productReq.productID = product._id;
        productReq.purchaseQuantity = 1;
        try {
          const res = await addToCartFn(productReq, user.token);
          console.log(res);
          //add to redux store for Cart, CartModal and showModalProductReducer
          dispatch({
            type: "ADD_TO_CART",
            payload: res.data,
          });
          dispatch({
            type: "TOGGLE_CARTMODAL",
            payload: true,
          });
          dispatch({
            type: "ADD_PRODUCT_TO_MODAL",
            payload: product,
          });
        } catch (err) {
          console.log(err);
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
                const res3 = await addToCartFn(productReq, res2.data.token);
                //add to redux store for Cart, CartModal and showModalProductReducer
                dispatch({
                  type: "ADD_TO_CART",
                  payload: res3.data,
                });
                dispatch({
                  type: "TOGGLE_CARTMODAL",
                  payload: true,
                });
                dispatch({
                  type: "ADD_PRODUCT_TO_MODAL",
                  payload: product,
                });
              } catch (err) {}
            }
          } else {
            //fail not because of auth token
          }
        }
      } else {
        //user NOT logged in
        let cart = [];
        if (localStorage.getItem("cart")) {
          cart = JSON.parse(localStorage.getItem("cart"));
        }
        //add quantity to product
        product.quantity = 1;
        //check if product exist in cart, if exist append the quantity, else push as a new array
        if (cart.length === 0) {
          cart.push({
            ...product,
          });
        } else {
          let itemExist = false;
          for (let i = 0; i < cart.length; i++) {
            if (cart[i]._id === product._id) {
              cart[i].quantity += 1;
              itemExist = true;
              break;
            }
          }
          if (!itemExist) {
            //if item not found after forloop, push to storage
            cart.push({
              ...product,
            });
          }
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        //add to redux store for Cart, CartModal and showModalProductReducer
        dispatch({
          type: "ADD_TO_CART",
          payload: cart,
        });
        dispatch({
          type: "TOGGLE_CARTMODAL",
          payload: true,
        });
        dispatch({
          type: "ADD_PRODUCT_TO_MODAL",
          payload: product,
        });
      }
    }
  };
  return <div>{card()}</div>;
};

export default ProductCard;
