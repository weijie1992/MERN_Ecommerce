import axios from "axios";
import setBearerToken from "../helper/setBearerToken";



export const getPaymentMethodFn = async (token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/getPaymentMethod`);
}

export const addPaymentMethodFn = async (token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/addPaymentMethod`);
}

export const deletePaymentMethodFn = async (token,paymentMethodID) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/deletePaymentMethodController/${paymentMethodID}`);
}

export const createPaymentIntentFn = async (token,paymentMethodID,addressID) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/createPaymentIntent`,{paymentMethodID,addressID});
}
