import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const addSubCategoryFn= async (name, parentCategory, token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/subcategory`,{name,parentCategory});
}

export const listSubCategoryFn= async () => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/subcategories`);
}

export const deleteSubCategoryFn= async (slug,token) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/subcategory/${slug}`);
}
export const updateSubCategoryFn= async (slug,updatedFormData,token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/subcategory/${slug}`,{...updatedFormData});
}

export const listSubCategoriesByCategoryFn = async (slug) => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/category/subcategory/${slug}`);
}   