import React, { useEffect, useState } from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { useSelector, useDispatch } from "react-redux";
import {
  adminGetUserOrdersFn,
  adminSearchOrderStatusFn,
} from "../../functions/order";
import { Link } from "react-router-dom";
import { Fragment } from "react";
import { Image } from "antd";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
import { adminUpdateOrderStatusFn } from "../../functions/order";

const AdminDashboard = () => {
  //set status for react select
  let orderStatuses = [
    "Payment Confirmed",
    "Delivering",
    "Completed",
    "Cancelled",
  ];
  //set state
  const [orders, setOrders] = useState([]);
  const [searchOrderID, setSearchOrderID] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  //get token from redux
  const { token } = useSelector((state) => {
    return state.user;
  });

  //dispatch
  const dispatch = useDispatch();

  const adminGetUserOrders = async (orderID, userID) => {
    try {
      orderID = orderID || "";
      userID = userID || "";
      console.log("orderID", orderID);
      console.log("userID", userID);
      const res = await adminGetUserOrdersFn(orderID, userID, token);
      console.log(res.data);
      setOrders(res.data);
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
            const res3 = await adminGetUserOrdersFn(
              orderID,
              userID,
              res2.data.token
            );
            setOrders(res3.data);
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

  const adminSearchOrderStatus = async (orderID, email) => {
    try {
      const res = await adminSearchOrderStatusFn(orderID, email, token);
      setOrders(res.data);
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
            const res3 = await adminSearchOrderStatusFn(
              orderID,
              email,
              res2.data.token
            );
            setOrders(res3.data);
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
    if (searchOrderID === "" && searchEmail ==="") {
      adminGetUserOrders();
    } 
  }, [searchOrderID,searchEmail]);

  useEffect(() => {
    if (searchOrderID !== "" || searchEmail !== "") {
      console.log("COME in here");
      let timer = setTimeout(() => {
        //call backend
        adminSearchOrderStatus(searchOrderID, searchEmail);
      }, 300);
      return () => clearTimeout(timer);
    } 
  }, [searchOrderID,searchEmail]);
  const displayPurchaseOrder = () => {
    return orders.map((order) => {
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
            <div className="col-md">
              Update Status :{" "}
              <select
                value={order.orderStatus}
                onChange={(event) =>
                  handleOrderStatusChange(order._id, order.orderStatus, event)
                }
              >
                {orderStatuses.map((os) => {
                  return (
                    <option value={os} key={os}>
                      {os}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="col-md-3">
              Order Total : ${`${order.totalPriceBeforeDiscount}`}
            </div>
          </div>
        </div>
      );
    });
  };

  const handleOrderStatusChange = async (
    order_id,
    initiateOrderStatus,
    event
  ) => {
    if (typeof window !== "undefined") {
      if (
        window.confirm(
          `Updating Status from ${initiateOrderStatus} to ${event.target.value}`
        )
      ) {
        const updatedOrderStatus = event.target.value;

        // let updatedOrders = [...orders];
        // updatedOrders.forEach((o) => {
        //   if (o._id === order_id) {
        //     o.orderStatus = updatedOrderStatus
        //   }
        //   return o;
        // });
        try {
          await adminUpdateOrderStatusFn(order_id, updatedOrderStatus, token);
          adminGetUserOrders();
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
                await adminUpdateOrderStatusFn(
                  order_id,
                  updatedOrderStatus,
                  token
                );
                adminGetUserOrders();
              } catch (err) {
                // todo set error
              }
            }
          } else {
            //fail not because of auth token
            // todo set error
          }
        }
      }
    }
  };

  const handleOrderIDChange = (e) => {
    setSearchOrderID(e.target.value);
  };

  const handleEmailChange = (e) => {
    setSearchEmail(e.target.value);
  };

  return (
    <div className="row">
      <div className="col-md-2">
        <AdminSideBar />
      </div>
      <div className="col-md-10">
        <div>
          <div className="col-md-6 border float-left">
            <div className="form-inline">
              Search By Order ID :
              <input
                type="search"
                value={searchOrderID}
                className="form-control form-control-sm ml-2"
                onChange={handleOrderIDChange}
              />
            </div>
          </div>
          <div className="col-md-6 border float-right">
          <div className="form-inline">
            Search By Email :{" "}
            <input
              type="search"
              value={searchEmail}
              className="form-control form-control-sm ml-2"
              onChange={handleEmailChange}
            />{" "}
            </div>
          </div>
        </div>
        <div style={{ clear: "both" }}>{displayPurchaseOrder()}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
