import React, { useEffect, useState } from "react";
import { getCategoriesFn } from "../../functions/category";
import { listSubCategoriesByCategoryFn } from "../../functions/subCategory";
import { shippingProvidersFn } from "../../functions/shipping";
import { addProductFn } from "../../functions/product";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBAlert } from 'mdbreact';
import { Select, Upload, Modal } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import ImgCrop from "antd-img-crop";
import { useSelector, useDispatch } from "react-redux";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";

//for preview function
const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}
//convert dataURL to file. This function will be called when new images is updated.
const dataURLtoFile = (dataurl, filename) => {

    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
}
//Initial State for form data to Server
const initialState = {
    name: "",
    description: "",
    price: "",
    availableQuantity: "",
    sold: "",
    images: {},
    ratings: [],
    color: [],
    category: "",
    subCategories: [],
    brand: "",
    shippingProvider: [],
}
//database categories, subcategories on selected category and all shipping provider
const initialLoadDataState = {
    loadCategories: [],
    loadSubCategoriesByCategory: [],
    loadShippingProvider: []
}
//Initial State for antdesign image upload
const initialImageState = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [
    ]
}

const CreateProduct = () => {

    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    //form data state to push to server
    const [formData, setFormData] = useState(initialState);
    const { name, description, price, availableQuantity, sold, images, ratings, color, category, subCategories, brand, shippingProvider } = formData;
    //database state
    const [loadData, setLoadData] = useState(initialLoadDataState);
    const { loadCategories, loadSubCategoriesByCategory, loadShippingProvider } = loadData;
    //for ant design upload image
    const [imageState, setImageState] = useState(initialImageState);

    //fetch all database's shipping providers and set to loadData state
    const getShippingProviders = async () => {
        const res = await shippingProvidersFn();
        setLoadData(prevLoadData => ({
            ...prevLoadData, loadShippingProvider: res.data
        }))
    }
    //fetch all database's categories and set to loadData state
    const getCategories = async () => {
        const res = await getCategoriesFn();
        setLoadData(prevLoadData => ({
            ...prevLoadData, loadCategories: res.data
        }))
    };
    //update successful or fail response from backend
    const [response, setResponse] = useState({
        message: "",
        css: null,
    });
    const { message, css } = response;

    useEffect(() => {
        getCategories();

    }, []);
    useEffect(() => {
        getShippingProviders();
    }, []);

    //create product form
    const createProductForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <MDBCol><p className="h4 py-4">Create Product</p></MDBCol>
                <MDBInput
                    label="name"
                    outline
                    type="text"
                    name="name"
                    value={name}
                    onChange={handleChange}
                    autoFocus
                />
                <MDBInput
                    label="description"
                    outline
                    type="textarea"
                    name="description"
                    value={description}
                    onChange={handleChange}
                />
                <MDBInput
                    label="price"
                    outline
                    type="number"
                    name="price"
                    value={price}
                    onChange={handleChange}
                />
                <MDBInput
                    label="availableQuantity"
                    outline
                    type="number"
                    name="availableQuantity"
                    value={availableQuantity}
                    onChange={handleChange}
                />
                <Select
                    mode="multiple"
                    className="w-100"
                    placeholder="Select Available Shipping Providers"
                    value={shippingProvider}
                    onChange={shippingProviderData => setFormData({ ...formData, shippingProvider: shippingProviderData })}
                >
                    {loadShippingProvider.map((sp) => {
                        return <Select.Option key={sp._id} value={sp._id}>{sp.name}</Select.Option>
                    })}
                </Select>
                <br /><br />
                <select
                    className="custom-select w-100"
                    name="category"
                    onChange={handleChange}
                >
                    <option value="">Select A Category</option>
                    {loadCategories.map(c => {
                        return <option key={c._id} value={c._id}>{c.name}</option>
                    })}
                </select>
                <br /><br />
                {loadSubCategoriesByCategory && loadSubCategoriesByCategory.length > 0 &&
                    (
                        <>
                            <Select
                                mode="multiple"
                                className="w-100"
                                placeholder="Select Sub Categories"
                                value={subCategories}
                                onChange={subData => setFormData({ ...formData, subCategories: subData })}
                            >
                                {loadSubCategoriesByCategory.map(lsc => {
                                    return <Select.Option key={lsc._id} value={lsc._id}>{lsc.name}</Select.Option>
                                })}
                            </Select>
                            <br /><br />
                        </>)}
                <MDBRow>
                    <MDBCol size="4" ><MDBBtn color="light" disabled={!(name && price && availableQuantity && category)} type="submit">Create Product</MDBBtn></MDBCol>
                    <MDBAlert color={css}>{message}</MDBAlert>
                </MDBRow>
            </form>
        );
    }

    const handleSubmit = async e => {
        e.preventDefault();

        //set multi part form data request
        let formDataReq = new FormData();
        formDataReq.append("name", name);
        formDataReq.append("description", description);
        formDataReq.append("price", price);
        formDataReq.append("availableQuantity", availableQuantity);
        formDataReq.append("category", category);
        formDataReq.append("subCategories", subCategories);
        formDataReq.append("shippingProvider", shippingProvider);

        imageState.fileList.forEach((fileListItem, index) => {
            console.log(fileListItem);
            let imageFileName = fileListItem.name + index + Math.floor(Date.now() / 1000); // imageFileName = imagename +timestamp
            let imageFileBase64 = fileListItem.url; //image data in base64, use preview which give a better quality
            let fileExtension = imageFileBase64.substring("data:image/".length, imageFileBase64.indexOf(";base64"));//image extension
            let file = dataURLtoFile(imageFileBase64, imageFileName + "." + fileExtension);//Convert imageData in base64 to image file format. The 1st parameter is the base64 string, second parameter is the filename
            formDataReq.append("images", file);
        });

        //clear all state to when success to allow next product to be added
        try {
            const res = await addProductFn(formDataReq, user.token);
            setFormData(initialState);
            setLoadData(initialLoadDataState);
            setImageState(initialImageState);
            getCategories();
            getShippingProviders();
            setResponse({ ...response, message: res.data, css: "success" });

        } catch (err) {
            if (err.response.data.error === "J01") {
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken) {
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        const res3 = await addProductFn(formDataReq, res2.data.token);
                        setFormData(initialState);
                        setLoadData(initialLoadDataState);
                        setImageState(initialImageState);
                        getCategories();
                        getShippingProviders();
                        setResponse({ ...response, message: res3.data, css: "success" });
                    } catch (err) {
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                }
            } else { //fail not because of auth token
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
    }

    const handleChange = async e => {
        //if category was changed, clear subcategories and get subcategories based on the changed selected category
        if (e.target.name === "category") {
            if (e.target.value === "") {
                setFormData({ ...formData, subCategories: [], category: e.target.value })
                setLoadData({ ...loadData, loadSubCategoriesByCategory: [] });
            } else {
                setFormData({ ...formData, subCategories: [], category: e.target.value })
                const res = await listSubCategoriesByCategoryFn(e.target.value);
                setLoadData({ ...loadData, loadSubCategoriesByCategory: res.data });
            }
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    }

    const handleModalCancel = () => {
        return setImageState({ ...imageState, previewVisible: false })
    }
    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        }
        setImageState({
            ...imageState,
            previewImage: file.url || file.preview,
            previewVisible: true,
            previewTitle: file.name || file.url.substring(file.url.lastIndexOf('/') + 1),
        })
    };

    const handleImageChange = async (data) => {
        const reader = new FileReader();
        //onload takes a call back function, e.target.result will be the result return by readAsDataURL
        reader.onload = e => {
            data.file.url = e.target.result;
            return setImageState({
                ...imageState,
                fileList: data.fileList
            })
        } //end onload
        reader.readAsDataURL(data.file.originFileObj);
    };
    //upload button icon
    const uploadButton = () => {
        return <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    }
    //dummyRequest for that always return ok
    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };

    const uploadImageForm = () => {
        return (
            <div className="col-centered">
                <ImgCrop rotate>
                    <Upload
                        customRequest={dummyRequest} //always return ok, not exactly sure what is this
                        listType="picture-card"
                        fileList={imageState.fileList}
                        onPreview={handlePreview}
                        onChange={handleImageChange}
                    >
                        {imageState.fileList.length >= 8 ? null : uploadButton()}
                    </Upload>
                </ImgCrop>
                <Modal
                    visible={imageState.previewVisible}
                    // title={imageState.previewTitle}
                    footer={null}
                    onCancel={handleModalCancel}
                >
                    <img alt="example" style={{ width: '100%' }} src={imageState.previewImage} />
                </Modal>
            </div>
        )
    };

    //render UI
    return (<div className="row">
        <div className="col-md-2">
            <AdminSideBar />
        </div>
        <div className="col-md-10">
            <MDBCard className="p-3 mt-5">
                <div className="row">
                    <div className="col-md-8">
                        {createProductForm()}
                    </div>
                    <div className="col-md-4">
                        {uploadImageForm()}
                    </div>
                </div>
            </MDBCard>
        </div>

    </div>);
}

export default CreateProduct;