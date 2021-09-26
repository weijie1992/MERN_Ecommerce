import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const addProductFn = async (productFormData, token) => {
    setBearerToken(token);
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/product`,
        productFormData,
        {
            headers:
            {
                'Content-Type': 'multipart/form-data'
            }
        });
}

export const getProductsFn = async () => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/products`);
}

export const deleteProductFn = async (slug, token) => {
    setBearerToken(token);
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/product/${slug}`);
}

export const getProductFn = async slug => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/product/${slug}`);
}

export const updateProductFn = async (slug, form, token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/product/${slug}`, form);
}

export const getProductsBySearchFilterFn = async (sort, order, pageNum) => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/productsSearchFilter`, {sort, order, pageNum});
}

export const getProductsCountFn = async () => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/productsCount`);
}

export const getRelatedProductsFn = async (productID,categoryID) => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/getRelatedProducts/${productID}/${categoryID}`);
}

export const getProductBySubcategoryFn = async (slug,sortBy) => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/getProductBySubcategory/${slug}?sortBy=${sortBy}`);
}


export const searchProductFn = async (keyword,sortBy,subCategories,price,shippingProviders) => {
    let queryParam = "";
    if(keyword) {
        queryParam = queryParam + `keyword=${keyword}`;
    } 
    if(sortBy) {
        queryParam = queryParam + `&sortBy=${sortBy}`;
    } 
    if(subCategories.length>0) {
        queryParam = queryParam + `&subCategories=${subCategories}`;
    } 
    if(price && price.max>0) {
        queryParam = queryParam + `&minPrice=${price.min}&maxPrice=${price.max}`;
    }
    if(shippingProviders) {
        queryParam = queryParam + `&shippingProviders=${shippingProviders}`;
    }

    return await axios.get(`${process.env.REACT_APP_SERVER_API}/search?${queryParam}`);
}

export const getProductQuantityFn = async (productID) => {
    return await axios.get(`${process.env.REACT_APP_SERVER_API}/getProductQuantity/${productID}`);
}
// export const uploadToTempAWSDirectoryFn = async (productFormImage, token) => {
//     console.log("********* console.log(productFormImage);****");
//     console.log(productFormImage);
//     setBearerToken(token);
//     return await axios.post(`${process.env.REACT_APP_SERVER_API}/productImage`,
//         productFormImage,
//         {
//             headers:
//             {
//                 'Content-Type': 'multipart/form-data'
//             }
//         });
// }