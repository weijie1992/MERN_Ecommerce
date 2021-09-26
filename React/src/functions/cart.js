import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const addCartBeforeLoginFn = async (cart, token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/user/addCartBeforeLogin`, { cart })
}

export const getUserCartOnLoginFn = async (token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/user/getUserCartOnLogin`)
}

export const deleteSingleCartItemFn = async (productID, token) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/user/cart/${productID}`);
}

export const addToCartFn = async (product, token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/user/cart`, product);
}

export const updateCartQuantityFn = async (product, token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/user/cart`, product);
}

export const getUserCartOnCheckoutFn = async (token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/user/getUserCartOnCheckout`,{});
}

export const emptyCart = async (token) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/user/emptyCart`);
}