import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const getCategoriesFn = async () => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/categories`);
}

export const getCategoryFn = async () => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/category/:slug`);
}

export const addCategoryFn = async (name,token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/category`,{name});
}

export const updateCategoryFn = async (updatedCategoryName,slug,token) => {
    setBearerToken(token);
    console.log(updatedCategoryName,slug);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/category/${slug}`,{updatedCategoryName});
}

export const deleteCategoryFn = async (slug,token) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/category/${slug}`);
}

