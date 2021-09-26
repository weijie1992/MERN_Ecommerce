import axios from "axios";

export const shippingProvidersFn = async() => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/shippingProviders`);
} 