import React, { useEffect, useState } from "react";
import { Fragment } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { getUserCartOnCheckoutFn } from "../functions/cart";
import { getUserInfoFn, updateUserInfoFn } from "../functions/user";
import {
  createPaymentIntentFn,
  getPaymentMethodFn,
  addPaymentMethodFn,
  deletePaymentMethodFn,
} from "../functions/stripe";
import { useStripe } from "@stripe/react-stripe-js";

import { Image, Modal, Button } from "antd";
import { MDBInput } from "mdbreact";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";
import DisplayOrderSummary from "../components/DisplayOrderSummary";
//Stripe
import { loadStripe } from "@stripe/stripe-js";
import StripeSetupIntent from "../components/StripeSetupIntent";
import { Elements } from "@stripe/react-stripe-js";
// Make sure to call loadStripe outside of a component’s render to avoid
// recreating the Stripe object on every render.
// loadStripe is initialized with your real test publishable API key.
const promise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
  //initiate stripe
  // const stripe = useStripe();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => {
    return { ...state };
  });

  const initialCartState = {
    products: [],
    discountedPrice: 0,
    totalPriceBeforeDiscount: 0,
    totalPriceAfterDiscount: 0,
    promoCode: "",
  };
  const initialUserState = {
    name: "",
    addresses: [],
  };
  const [cart, setCart] = useState(initialCartState);
  const {
    products,
    totalPriceBeforeDiscount,
    totalPriceAfterDiscount,
    discountedPrice,
    promoCode,
  } = cart;

  const [dbuser, setDBUser] = useState(initialUserState);
  const { name, addresses } = dbuser;

  const [chosenAddress, setChosenAddress] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);

  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);

  const [addressForm, setAddressForm] = useState({
    buildingOrStreet: "",
    unitNo: "",
    country: "Singapore",
    city: "SG",
    postalCode: "",
    contactNumber: "",
  });

  const { buildingOrStreet, unitNo, country, city, postalCode, contactNumber } =
    addressForm;

  const [updateAddressForm, setUpdateAddressForm] = useState({
    buildingOrStreet: "",
    unitNo: "",
    country: "Singapore",
    city: "SG",
    postalCode: "",
    contactNumber: "",
  });
  const [addModalError, setAddModalError] = useState("");
  const [editModalError, setEditModalError] = useState("");

  const [paymentMethods, setPaymentMethods] = useState([]);
  const [chosenPaymentMethod, setChosenPaymentMethod] = useState("");

  const [isAddNewCardModalVisible, setIsAddNewCardModalVisible] =
    useState(false);
  const [clientSecretForPaymentMethod, setclientSecretForPaymentMethod] =
    useState("");
  const [clientSecretForPaymentIntent, setclientSecretForPaymentIntent] =
    useState("");
  const [error, setError] = useState(null);

  const getUserCartOnCheckout = async () => {
    try {
      const res = await getUserCartOnCheckoutFn(user.token);
      setCart(res.data);
    } catch (err) {
      //todo display error
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            const res3 = await getUserCartOnCheckoutFn(res2.data.token);
            setCart(res3.data);
          } catch (err) {
            //todo display error
          }
        }
      }
    }
  };

  const getUserInfo = async (address_id) => {
    try {
      const res = await getUserInfoFn(user.token);
      setDBUser((prevData) => ({
        ...prevData,
        name: res.data.name,
        addresses: res.data.addresses,
      }));
      //if not a add/update/delete of address automatically select the latest address
      if (!address_id) {
        console.log(res.data.addresses);
        if (res.data && res.data.addresses && res.data.addresses.length > 0) {
          setChosenAddress(
            res.data.addresses[res.data.addresses.length - 1]._id
          );
        } else {
          setChosenAddress("");
        }
      }
    } catch (err) {
      //todo display error
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            const res3 = await getUserInfoFn(res2.data.token);
            setDBUser((prevData) => ({
              ...prevData,
              name: res3.data.name,
              addresses: res3.data.addresses,
            }));
            //if not a add/update/delete of address automatically select the latest address
            if (!address_id) {
              console.log(res3.data.addresses);
              if (
                res3.data &&
                res3.data.addresses &&
                res3.data.addresses.length > 0
              ) {
                setChosenAddress(
                  res3.data.addresses[res3.data.addresses.length - 1]._id
                );
              } else {
                setChosenAddress("");
              }
            }
          } catch (err) {
            //todo display error
          }
        }
      }
    }
  };

  const getPaymentMethod = async () => {
    try {
      const res = await getPaymentMethodFn(user.token);
      if (res.status === 200) {
        const pms = res.data;
        setPaymentMethods(pms);
        setChosenPaymentMethod(pms[pms.length - 1].id);
      } else if (res.status === 204) {
        setPaymentMethods([]);
        setChosenPaymentMethod("");
      }
    } catch (err) {
      //todo display error
      const rfAuthToken = getRefreshToken();
      if (rfAuthToken) {
        try {
          const res2 = await refreshTokenFn(rfAuthToken);
          const res3 = await getUserInfoFn(res2.data.token);
          if (res3.status === 200) {
            setPaymentMethods(res3.data);
          } else if (res3.status === 204) {
            setPaymentMethods([]);
            setChosenPaymentMethod("");
          }
        } catch (err) {
          //todo display error
        }
      }
    }
  };

  const addPaymentMethod = async () => {
    try {
      const res = await addPaymentMethodFn(user.token);
      console.log(res.data);
      setclientSecretForPaymentMethod(res.data.clientSecret);
    } catch (err) {
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            const res3 = await addPaymentMethodFn(res2.data.token);
            setclientSecretForPaymentMethod(
              res3.data.clientSecret
            );
          } catch (err) {
            //setError(err.response.data.error);
          }
        }
      } else {
        //setError(err.response.data.error);
      }
    }
  };

  useEffect(() => {
    getUserCartOnCheckout();
  }, []);
  useEffect(() => {
    getUserInfo();
  }, []);

  useEffect(() => {
    getPaymentMethod();
  }, []);

  const displayCartItemHeader = () => {
    return (
      <>
        <div className="row mb-3">
          <div className="col-md-6 font-weight-bold">Products</div>
          <div className="col-md-2 font-weight-bold">Price</div>
          <div className="col-md-2 font-weight-bold">Quantity</div>
          <div className="col-md-2 font-weight-bold">Total Price:</div>
        </div>
        <hr />
      </>
    );
  };



  const displayShippingDetails = () => {
    return (
      <Fragment>
        <div>
          <h5>Delivery Address</h5>
          {addresses && addresses.length > 0 ? (
            addresses.map((address) => {
              return (
                <div
                  key={address._id}
                  className={
                    address._id === chosenAddress ? "activeDiv" : "inactiveDiv"
                  }
                  style={{ marginBottom: "4px" }}
                >
                  <div
                    className="p-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      setChosenAddress(address._id);
                      setUpdateAddressForm(address);
                    }}
                  >
                    <div className="row">
                      <div className="col-md-8">
                        <div>
                          {address.buildingOrStreet} | {address.unitNo}
                        </div>
                        <div>
                          {address.country}, {address.postalCode}
                        </div>
                        <div>
                          {address.city} | {address.contactNumber}
                        </div>
                      </div>
                      <div className="col-md-4 mt-auto mb-auto">
                        <div className="row pt-3">
                          <div className="col-md-4">
                            <Button
                              type="primary"
                              onClick={() => handleEditAddress()}
                            >
                              Edit
                            </Button>
                          </div>
                          <div className="col-md-4">
                            <Button
                              type="danger"
                              onClick={() => handleDeleteAddress(address._id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <h6 className="text-danger">You need to add an address</h6>
          )}
        </div>
      </Fragment>
    );
  };

  const handleEditAddress = () => {
    //display modal
    setIsUpdateModalVisible(true);
  };
  const handleAddAddress = async (e) => {
    e.preventDefault();
    const updatedUserInfo = {};
    //For Add New Address
    //Send all address to server.
    updatedUserInfo.addresses = addresses;
    updatedUserInfo.addresses.push(addressForm);

    try {
      const res = await updateUserInfoFn(updatedUserInfo, user.token);
      //clear modal
      setIsModalVisible(false);
      //render delivery address, pass in addressForm._id if addressForm._id to check if it is a update or add record, if update, do not need to set state the chosen address to last
      getUserInfo(addressForm._id);
      //clear state
      setAddressForm({
        buildingOrStreet: "",
        unitNo: "",
        country: "Singapore",
        city: "SG",
        postalCode: "",
        contactNumber: "",
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
            const res3 = await updateUserInfoFn(
              updatedUserInfo,
              res2.data.token
            );
            //clear modal
            setIsModalVisible(false);
            //render delivery address
            getUserInfo(addressForm._id);
            //clear state
            setAddressForm({
              buildingOrStreet: "",
              unitNo: "",
              country: "Singapore",
              city: "SG",
              postalCode: "",
              contactNumber: "",
            });
          } catch (err) {}
        } else {
          //fail not because of auth token
        }
      }
    }
  };
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    //For Update Existing Address AddressForm._id will be in the state
    const updatedUserInfo = {};
    const updatedAddress = addresses.map((a) => {
      if (a._id === updateAddressForm._id) {
        a = updateAddressForm;
      }
      return a;
    });
    updatedUserInfo.addresses = updatedAddress;

    try {
      const res = await updateUserInfoFn(updatedUserInfo, user.token);
      //clear modal
      setIsUpdateModalVisible(false);
      //render delivery address, pass in addressForm._id if addressForm._id to check if it is a update or add record, if update, do not need to set state the chosen address to last
      getUserInfo(updateAddressForm._id);
      //clear state
      setUpdateAddressForm({
        buildingOrStreet: "",
        unitNo: "",
        country: "Singapore",
        city: "SG",
        postalCode: "",
        contactNumber: "",
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
            const res3 = await updateUserInfoFn(
              updatedUserInfo,
              res2.data.token
            );
            //clear modal
            setIsUpdateModalVisible(false);
            //render delivery address
            getUserInfo(addressForm._id);
            //clear state
            setUpdateAddressForm({
              buildingOrStreet: "",
              unitNo: "",
              country: "Singapore",
              city: "SG",
              postalCode: "",
              contactNumber: "",
            });
          } catch (err) {}
        } else {
          //fail not because of auth token
        }
      }
    }
  };
  const handleDeleteAddress = async (address_id) => {
    let counNumberOfAddressDeleted = 0;
    console.log("init length");
    console.log(addresses.length);
    const addressAfterDelete = addresses.filter((a) => {
      if (a._id !== address_id) {
        return a._id;
      } else {
        counNumberOfAddressDeleted++;
      }
    });
    console.log(addressAfterDelete);
    console.log(counNumberOfAddressDeleted);
    console.log("after length");
    console.log(addressAfterDelete.length);
    if (counNumberOfAddressDeleted === 1) {
      try {
        const updatedUserInfo = {};
        updatedUserInfo.addresses = addressAfterDelete;
        console.log("call api here");
        const res = await updateUserInfoFn(updatedUserInfo, user.token);
        getUserInfo();
      } catch (err) {}
    } else {
      //got issue
      //
    }
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const handleCancelForUpdate = () => {
    setIsUpdateModalVisible(false);
  };
  const displayCartItemContent = () => {
    return products.map((c) => {
      return (
        <div key={c._id}>
          <div className="row">
            <div className="col-md-6">
              <div className="row">
                <div className="col-md-4">
                  <Link to={`../productDetails/${c.product.slug}`}>
                    <Image
                      src={`${process.env.REACT_APP_AWSS3DIR}/${c.product.images[0]}`}
                      preview={false}
                      width={100}
                    />
                  </Link>
                </div>
                <div className="col-md-8">
                  <div className="font-weight-bold">{c.product.name}</div>
                  <div>{c.product.description}</div>
                </div>
              </div>
            </div>
            <div className="col-md-2">SGD${c.product.price.toFixed(2)}</div>
            <div className="col-md-2">
              {c.purchaseQuantity}
              <br />
            </div>
            <div className="col-md-2">SGD${c.totalPriceWithQuantity.toFixed(2)}</div>
          </div>
          <hr />
        </div>
      );
    });
  };

  const displayUpdateAddressModal = () => {
    return (
      <Modal
        title="Update Address"
        visible={isUpdateModalVisible}
        onOk={editModalError === "" && handleUpdateAddress}
        onCancel={handleCancelForUpdate}
      >
        <MDBInput
          label="Building Or Street"
          group
          type="text"
          value={updateAddressForm.buildingOrStreet}
          onChange={handleUpdateAddressChange("buildingOrStreet")}
          autoFocus
        />
        <MDBInput
          label="Unit No"
          group
          type="text"
          value={updateAddressForm.unitNo}
          onChange={handleUpdateAddressChange("unitNo")}
        />
        <MDBInput
          label="Country"
          group
          type="text"
          value={updateAddressForm.country}
          disabled={true}
        />
        <MDBInput
          label="City"
          group
          type="text"
          value={updateAddressForm.city}
          disabled={true}
        />
        <MDBInput
          label="Postal Code"
          group
          type="number"
          value={updateAddressForm.postalCode}
          onChange={handleUpdateAddressChange("postalCode")}
        />
        <div className="text-danger">{editModalError}</div>
        <MDBInput
          label="Contact Number"
          group
          type="number"
          value={updateAddressForm.contactNumber}
          onChange={handleUpdateAddressChange("contactNumber")}
        />
      </Modal>
    );
  };
  const handleUpdateAddressChange = (key) => (e) => {
    if (key === "postalCode") {
      console.log(e.target.value);
      if (e.target.value.length < 6) {
        setEditModalError("PostalCode Must be 6 character");
        setUpdateAddressForm({ ...updateAddressForm, [key]: e.target.value });
      } else if (e.target.value.length === 6) {
        setUpdateAddressForm({ ...updateAddressForm, [key]: e.target.value });
        setEditModalError("");
      }
    } else {
      setUpdateAddressForm({ ...updateAddressForm, [key]: e.target.value });
    }
  };

  const displayAddressModal = () => {
    return (
      <Modal
        title="Add New Address"
        visible={isModalVisible}
        onOk={addModalError === "" && handleAddAddress}
        onCancel={handleCancel}
      >
        <MDBInput
          label="Building Or Street"
          group
          type="text"
          value={buildingOrStreet}
          onChange={handleAddAddressChange("buildingOrStreet")}
          autoFocus
        />
        <MDBInput
          label="Unit No"
          group
          type="text"
          value={unitNo}
          onChange={handleAddAddressChange("unitNo")}
        />
        <MDBInput
          label="Country"
          group
          type="text"
          value={country}
          disabled={true}
        />
        <MDBInput label="City" group type="text" value={city} disabled={true} />
        <MDBInput
          label="Postal Code"
          group
          type="number"
          min="6"
          max="6"
          value={postalCode}
          onChange={handleAddAddressChange("postalCode")}
        />
        <div className="text-danger">{addModalError}</div>
        <MDBInput
          label="Contact Number"
          group
          type="text"
          value={contactNumber}
          onChange={handleAddAddressChange("contactNumber")}
        />
      </Modal>
    );
  };
  const handleAddAddressChange = (key) => (e) => {
    if (key === "postalCode") {
      console.log(e.target.value);
      if (e.target.value.length < 6) {
        setAddModalError("PostalCode Must be 6 character");
        setAddressForm({ ...addressForm, [key]: e.target.value });
      } else if (e.target.value.length === 6) {
        setAddModalError("");
        setAddressForm({ ...addressForm, [key]: e.target.value });
      }
    } else {
      setAddressForm({ ...addressForm, [key]: e.target.value });
    }
  };

  const addDeliveryAddress = () => {
    return (
      <div>
        <button
          type="button"
          className="btn btn-link border"
          onClick={() => setIsModalVisible(true)}
        >
          Add New Address
        </button>
      </div>
    );
  };

  const handleRemovePaymentMethod = async (paymentMethodID) => {
    try {
      await deletePaymentMethodFn(user.token, paymentMethodID);
      getPaymentMethod();
    } catch (err) {
      //todo display error
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            await deletePaymentMethodFn(res2.data.token, paymentMethodID);
            getPaymentMethod();
          } catch (err) {
            //todo display error
          }
        }
      }
    }
  };

  const displayPaymentMethod = () => {
    return (
      <Fragment>
        <div>
          <h5>Payment Method</h5>
          {paymentMethods && paymentMethods.length > 0
            ? paymentMethods.map((pm) => {
                return (
                  <div
                    key={pm.id}
                    className={
                      pm.id === chosenPaymentMethod
                        ? "activeDiv"
                        : "inactiveDiv"
                    }
                    style={{ marginBottom: "4px" }}
                  >
                    <div
                      className="p-2"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        setChosenPaymentMethod(pm.id);
                      }}
                    >
                      <div className="row">
                        <div className="col-md-8">
                          {pm.card.brand} | expire on : {pm.card.exp_month}/
                          {pm.card.exp_year} | last 4 digits : {pm.card.last4}
                        </div>
                        <div className="col-md-4 mt-auto mb-auto">
                          <Button
                            type="link"
                            block
                            className="text-danger"
                            onClick={() => handleRemovePaymentMethod(pm.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            : null}
        </div>
      </Fragment>
    );
  };

  const addNewCard = () => {
    return (
      <div>
        <button
          type="button"
          className="btn btn-link border"
          onClick={() => {
            addPaymentMethod();
            setIsAddNewCardModalVisible(true);
          }}
        >
          Add New Card
        </button>
      </div>
    );
  };

  const handleCancelForAddCard = () => {
    setIsAddNewCardModalVisible(false);
    getPaymentMethod();
  };

  const displayNewCardModal = () => {
    console.log("in displayNewCardModal");
    return (
      <Modal
        footer={null}
        title="Add New Card"
        visible={isAddNewCardModalVisible}
        // onOk={editModalError === "" && handleUpdateAddress}
        onCancel={handleCancelForAddCard}
      >
        <StripeSetupIntent
          handleCancelForAddCard={handleCancelForAddCard}
          isAddNewCardModalVisible={isAddNewCardModalVisible}
          clientSecretForPaymentMethod={clientSecretForPaymentMethod}
        />
      </Modal>
    );
  };

  return (
    <Fragment>
      {displayAddressModal()}
      <h3>Review Your Order</h3>
      <hr />
      <div className="row">
        <div className="col-md-8">
          {/* {JSON.stringify(chosenAddress)}
          {JSON.stringify(chosenPaymentMethod)}
          {JSON.stringify(clientSecretForPaymentMethod)} */}
          {/* {JSON.stringify(chosenPaymentMethod)} */}
          {displayShippingDetails()}
          {displayUpdateAddressModal()}
          {addDeliveryAddress()}
          <hr />
          {displayPaymentMethod()}
          {addNewCard()}
          {displayNewCardModal()}
          <hr />
          {displayCartItemHeader()}
          {displayCartItemContent()}
        </div>
        {/* <div className="col-md-4">{displayOrderSummary()}</div> */}
        <div className="col-md-4">
          <Elements stripe={promise}>
            <DisplayOrderSummary
              promoCode={promoCode}
              totalPriceBeforeDiscount={totalPriceBeforeDiscount}
              discountedPrice={discountedPrice}
              user={user}
              cart={cart}
              chosenAddress={chosenAddress}
              chosenPaymentMethod={chosenPaymentMethod}
              totalPriceAfterDiscount={totalPriceAfterDiscount}
            />
          </Elements>
        </div>
      </div>
    </Fragment>
  );
};

export default Checkout;
