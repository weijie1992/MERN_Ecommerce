import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const createOrderFn = async (paymentIntent,deliveryAddress, token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/createOrder`,{paymentIntent,deliveryAddress});
}

export const getUserOrderFn = async (orderStatus,token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/getUserOrder?orderStatus=${orderStatus}`);
}

export const userConfirmDeliveryFn = async (orderID,orderStatus,token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/userConfirmDelivery/${orderID}`,{orderStatus});
}

export const adminGetUserOrdersFn = async (orderID,userID,token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/adminGetUserOrder?orderID=${orderID}&userID=${userID}`);
}

export const adminUpdateOrderStatusFn = async (orderID, orderStatus,token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/adminUpdateUserOrder/${orderID}`,{orderStatus});
}

export const adminSearchOrderStatusFn = async ( orderID, email,token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/adminSearchOrderStatus?orderID=${orderID}&email=${email}`);
}
