import React, { useEffect, useState } from "react";
import UserSideBar from "../../components/nav/UserSideBar";
import { useSelector, useDispatch } from "react-redux";
import { getUserOrderFn, userConfirmDeliveryFn } from "../../functions/order";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
import { Image } from "antd";
import { Link } from "react-router-dom";
import { Fragment } from "react";

const PurchaseHistory = (props) => {
  const { token } = useSelector((state) => {
    return state.user;
  });

  //set state
  const [userOrder, setUserOrder] = useState([]);
  const [navActive, setNavActive] = useState("");
  const [urlStatus, setUrlStatus] = useState("");
  //dispatch
  const dispatch = useDispatch();

  const getUserOrder = async (status) => {
    try {
      const res = await getUserOrderFn(status, token);
      setUserOrder(res.data);
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
            const res3 = await getUserOrderFn(status, res2.data.token);
            setUserOrder(res3.data);
          } catch (err) {
            // todo set error
          }
        }
      } else {
        //fail not because of auth token
        // todo set error
      }
    }
  };

  useEffect(() => {
    console.log("#@!U#seEffect!@#");
    console.log(props.location.search);
    if (props.location && props.location.search !== "") {
      const status = props.location.search.split("?status=")[1];
      setUrlStatus(status);
      getUserOrder(status);
    } else {
      const status = "all";
      setUrlStatus(status);
      getUserOrder(status);
    }
  }, [props.location.search]);

  const handleConfirmDelivery = async (orderID, orderStatus) => {
    try {
      await userConfirmDeliveryFn(orderID, orderStatus, token);
      // props.history.replace({pathname:"purchaseHistory",search:"?status=Completed"});
      props.history.push({
        pathname: "purchaseHistory",
        search: "?status=Completed",
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
            await userConfirmDeliveryFn(orderID, orderStatus, res2.data.token);
            // props.history.replace({pathname:"purchaseHistory",search:"?status=Completed"});
            props.history.push({
              pathname: "purchaseHistory",
              search: "?status=Completed",
            });
          } catch (err) {
            // todo set error
          }
        }
      } else {
        //fail not because of auth token
        // todo set error
      }
    }
  };
  const displayPurchaseOrder = () => {
    return userOrder.map((order) => {
      return (
        <div
          className="m-3"
          style={{ border: "2px solid rgba(0, 0, 0, 0.1)" }}
          key={order._id}
        >
          <div className="mb-2">
            <span style={{ border: "1px solid orange" }}>
              Order ID : {order._id}
            </span>
            <span
              className="float-right"
              style={{ border: "1px solid orange" }}
            >
              Status : {order.orderStatus}
            </span>
          </div>
          {order.products.map((p) => {
            return (
              <Fragment key={p._id}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="row">
                      <div className="col-md-4">
                        <Link to={`../productDetails/${p.product.slug}`}>
                          <Image
                            src={`${process.env.REACT_APP_AWSS3DIR}/${p.product.images[0]}`}
                            preview={false}
                            width={100}
                          />
                        </Link>
                      </div>
                      <div className="col-md-8">
                        <div className="font-weight-bold">{p.product.name}</div>
                        <div className="font-weight-light">
                          {p.product.description}
                        </div>
                        <div className="font-weight">
                          Qty:{p.purchaseQuantity}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="font-weight-bold">
                      ${p.totalPriceWithQuantity}
                    </div>
                  </div>
                </div>
              </Fragment>
            );
          })}
          <hr />
          <div className="row pb-3" style={{ clear: "both" }}>
            <div className="col-md-3">
              {(order.orderStatus === "Payment Confirmed" ||
              order.orderStatus === "Delivering") && (
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm w-100"
                  onClick={() => handleConfirmDelivery(order._id, "Completed")}
                >
                  Confirm Delivery
                </button>
              ) }
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm w-100"
              >
                ReOrder
              </button>
            </div>
            <div className="col-md-3">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm w-100"
              >
                Refund
              </button>
            </div>
            <div className="col-md-3">
              Order Total : ${`${order.totalPriceBeforeDiscount}`}
            </div>
          </div>
        </div>
      );
    });
  };

  return (
    <div className="row">
      <div className="col-md-2">
        <UserSideBar />
      </div>
      <div className="col-md-10">
        <ul className="nav nav-tabs">
          <Link
            style={{ textDecoration: "none", color: "black" }}
            to="/user/purchaseHistory?status=all"
          >
            <li className="nav-item">
              <a
                className={urlStatus === "all" ? "nav-link active" : "nav-link"}
              >
                All
              </a>
            </li>
          </Link>
          <Link
            style={{ textDecoration: "none", color: "black" }}
            to="/user/purchaseHistory?status=Payment Confirmed"
          >
            <li className="nav-item">
              <a
                className={
                  urlStatus === "Payment Confirmed"
                    ? "nav-link active"
                    : "nav-link"
                }
              >
                Payment Confirmed
              </a>
            </li>
          </Link>
          <Link
            style={{ textDecoration: "none", color: "black" }}
            to="/user/purchaseHistory?status=Delivering"
          >
            <li className="nav-item">
              <a
                className={
                  urlStatus === "Delivering" ? "nav-link active" : "nav-link"
                }
              >
                Delivering
              </a>
            </li>
          </Link>
          <Link
            style={{ textDecoration: "none", color: "black" }}
            to="/user/purchaseHistory?status=Completed"
          >
            <li className="nav-item">
              <a
                className={
                  urlStatus === "Completed" ? "nav-link active" : "nav-link"
                }
              >
                Completed
              </a>
            </li>
          </Link>
          <Link
            style={{ textDecoration: "none", color: "black" }}
            to="/user/purchaseHistory?status=Cancelled"
          >
            <li className="nav-item">
              <a
                className={
                  urlStatus === "Cancelled" ? "nav-link active" : "nav-link"
                }
              >
                Cancelled
              </a>
            </li>
          </Link>
        </ul>
        {displayPurchaseOrder()}
      </div>
    </div>
  );
};

export default PurchaseHistory;
