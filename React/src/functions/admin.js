import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const adminCheckFn = async(token) => {
    setBearerToken(token);
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/admin/dashboard`);
}