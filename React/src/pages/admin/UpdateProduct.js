import React, { useEffect, useState } from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard } from 'mdbreact';
import { getProductFn, updateProductFn } from "../../functions/product";
import { getCategoriesFn } from "../../functions/category";
import { listSubCategoriesByCategoryFn } from "../../functions/subCategory";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { shippingProvidersFn } from "../../functions/shipping";
import { Select, Upload, Modal } from "antd";
import { PlusOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from "react-redux";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
import ImgCrop from "antd-img-crop";

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
    images: [],
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
    loadShippingProviders: []
}
//Product's parent category, subcategory and shipping provider state
const initialShowDataState = {
    showCategory: "",
    showSubCategoriesByCategory: [],
    showShippingProviders: []
}
//Initial State for antdesign image upload
const initialImageState = {
    previewVisible: false,
    previewImage: '',
    previewTitle: '',
    fileList: [
    ]
}

const UpdateProduct = ({ match, history }) => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();

    //form data state to push to server
    const [formData, setFormData] = useState(initialState);
    const { name, description, price, availableQuantity, sold, images, ratings, color, category, subCategories, brand, shippingProvider } = formData;
    //database state
    const [loadData, setLoadData] = useState(initialLoadDataState);
    const { loadCategories, loadSubCategoriesByCategory, loadShippingProviders } = loadData;
    //Product state
    const [showData, setShowData] = useState(initialShowDataState);
    const { showCategory, showSubCategoriesByCategory, showShippingProviders } = showData;
    //for ant design upload image
    const [imageState, setImageState] = useState(initialImageState);
    //fetch all database's shipping providers and set to loadData state
    const getShippingProviders = async () => {
        const res = await shippingProvidersFn();
        setLoadData(prevLoadData => ({
            ...prevLoadData, loadShippingProviders: res.data
        }))
    };
    //fetch all database's categories and set to loadData state
    const getCategories = async () => {
        const res = await getCategoriesFn();
        setLoadData(prevLoadData => ({ ...prevLoadData, loadCategories: res.data }));
    }
    //fetch all database's categories on selected category and set to loadData state
    const getSubCategoriesByCategory = async categoryID => {
        try {
            const subCategoriesRes = await listSubCategoriesByCategoryFn(categoryID);
            setLoadData(prevLoadData => ({ ...prevLoadData, loadSubCategoriesByCategory: subCategoriesRes.data }));
        } catch (err) {
            toast.error(err.response.data.error);
        }
    }
    //get current product data 
    const getProduct = async () => {
        try {
            const res = await getProductFn(match.params.slug);
            //only retrieve IDs for subcategory, shipping provider which will be easier to update on backend
            let subCategoriesIDs = res.data.subCategories.map(sc => sc._id);
            let shippingProviderIDs = res.data.shippingProvider.map(sp => sp._id);
            setFormData(prevState => ({
                ...prevState,
                name: res.data.name,
                description: res.data.description,
                price: res.data.price,
                availableQuantity: res.data.availableQuantity,
                sold: res.data.sold,
                images: res.data.images,
                ratings: res.data.ratings,
                color: res.data.color,
                category: res.data.category._id,
                subCategories: subCategoriesIDs,
                brand: res.data.brand,
                shippingProvider: shippingProviderIDs,
            })
            );
            //Displaying product images, by setting Imagestate require uid, name, status, url in each fileList object
            let fileListArray = [];
            let fileListObj = {};
            res.data.images.forEach(async (image, index) => {
                fileListObj.uid = index;
                fileListObj.name = image;
                fileListObj.status = "done";
                fileListObj.url = `${process.env.REACT_APP_AWSS3DIR}/${image}`;
                fileListArray.push(fileListObj);
                fileListObj = {};
            });
            setImageState({
                ...imageState,
                fileList: fileListArray
            });
            //Display product category, subcategories and shipping Provider and set to showData state which shows the multiselect and select component
            let shippingProviderArray = [];
            res.data.shippingProvider.map(sp => {
                return shippingProviderArray.push(sp._id);
            });
            let subCategoriesArray = [];
            res.data.subCategories && res.data.subCategories.length > 0 && res.data.subCategories.map(sc => {
                return subCategoriesArray.push(sc._id);
            })
            setShowData({
                ...showData,
                showShippingProviders: shippingProviderArray,
                showCategory: res.data.category,
                showSubCategoriesByCategory: subCategoriesArray
            });
            //load other subcategories base on existing category
            getSubCategoriesByCategory(res.data.category._id);
        } catch (err) {
            toast.error(err.response.data.error);
        }
    }

    useEffect(() => {
        getShippingProviders();
    }, []);
    useEffect(() => {
        getCategories();
    }, []);
    useEffect(() => {
        getProduct();
    }, []);

    //Update product form exclude antd upload image
    const updateProductForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <MDBCol><p className="h4 py-4">{`Update ${formData.name}`}</p></MDBCol>
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
                    allowClear
                    className="w-100"
                    placeholder="Select Available Shipping Providers"
                    value={showShippingProviders}
                    onChange={value => {
                        setShowData({ ...showData, showShippingProviders: value });
                        setFormData({ ...formData, shippingProvider: value });
                    }
                    }
                >
                    {loadShippingProviders.map((sp) => {
                        return <Select.Option key={sp._id} value={sp._id}>{sp.name}</Select.Option>
                    })}
                </Select>
                <br /><br />
                <select
                    className="custom-select w-100"
                    name="category"
                    onChange={handleCategoryChange}
                    value={category}
                >
                    {loadCategories.map(c => {
                        return <option key={c._id} value={c._id}>{c.name}</option>
                    })}
                </select>
                <br /><br />
                {
                    loadSubCategoriesByCategory && loadSubCategoriesByCategory.length > 0 &&
                    (
                        <>
                            <Select
                                mode="multiple"
                                allowClear
                                className="w-100"
                                placeholder="Select Sub Categories"
                                value={showSubCategoriesByCategory}
                                onChange={value => {
                                    setShowData({ ...showData, showSubCategoriesByCategory: value });
                                    setFormData({ ...formData, subCategories: value });
                                }}
                            >
                                {loadSubCategoriesByCategory.map(lsc => {
                                    return <Select.Option key={lsc._id} value={lsc._id}>{lsc.name}</Select.Option>
                                })}
                            </Select>
                            <br /><br />
                        </>)
                }

                <MDBRow>
                    <MDBCol size="4" ><MDBBtn color="light" disabled={!(name && price && availableQuantity && category)} type="submit">Update</MDBBtn></MDBCol>
                </MDBRow>
            </form >
        );
    }
    //handle change for input type text
    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }
    //handle change for category. when category changed, clear subcategories. Also load sub categories based on changed category.
    const handleCategoryChange = e => {
        //clear Sub Categories
        setFormData({ ...formData, category: e.target.value, subCategories: [] });
        setShowData({ ...showData, showSubCategoriesByCategory: [] });
        //Reload Sub category when category changed
        getSubCategoriesByCategory(e.target.value);
    }
    //on Submit
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
        let oldImagesArray = []; //require to push all old images name which is string to an array before append to "oldImages", it will not automatically set as array unlike file datatype
        //loop through imagestate, for newimages convert to file, old images, add to array and push add to formrequest after forEach
        imageState.fileList.forEach((fileListItem, index) => {
            if (fileListItem.dataUrl) {
                let imageFileName = fileListItem.name + index + Math.floor(Date.now() / 1000); // imageFileName = imagename +timestamp
                let imageFileBase64 = fileListItem.dataUrl; //image data in base64, use preview which give a better quality
                let fileExtension = imageFileBase64.substring("data:image/".length, imageFileBase64.indexOf(";base64"));//image extension
                let file = dataURLtoFile(imageFileBase64, imageFileName + "." + fileExtension);//Convert imageData in base64 to image file format. The 1st parameter is the base64 string, second parameter is the filename
                formDataReq.append("newImages", file);
            } else {
                oldImagesArray.push(fileListItem.name);
            }
        });//end foreach
        formDataReq.append("oldImages", oldImagesArray);

        //update function to backend
        try {
            const res = await updateProductFn(match.params.slug, formDataReq, user.token);
            history.push("/admin/viewAllProducts");
            toast.success(res.data);
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
                        const res3 = await updateProductFn(match.params.slug, formDataReq, res2.data.token);
                        history.push("/admin/viewAllProducts");
                        toast.success(res3.data);
                    } catch (err) { //2nd try still fail
                        toast.error(err.response.data.error);
                    }
                }
            } else { //fail not because of auth token
                toast.error(err.response.data.error);
            }
        }
    }

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
                {/*Modal is for displaying the preview */}
                <Modal
                    visible={imageState.previewVisible}
                    // title={imageState.previewTitle}
                    footer={null}
                    onCancel={handleModalCancel}
                >
                    <img alt={imageState.previewTitle} style={{ width: '100%' }} src={imageState.previewImage} />
                </Modal>
            </div>
        )
    };
    //dummyRequest for that always return ok
    const dummyRequest = ({ file, onSuccess }) => {
        setTimeout(() => {
            onSuccess("ok");
        }, 0);
    };
    //on preview clicked
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

    //Adding/Removing image
    const handleImageChange = async (data) => {
        // if new file added, add dataUrl
        if (data.file.originFileObj) {
            const reader = new FileReader();
            //onload takes a call back function, e.target.result will be the result return by readAsDataURL
            reader.onload = e => {
                data.file.dataUrl = e.target.result;
                return setImageState({
                    ...imageState,
                    fileList: data.fileList
                });
            }
            reader.readAsDataURL(data.file.originFileObj);
        }
        //for deleting old files update the state by replacing entire filelist
        return setImageState({
            ...imageState,
            fileList: data.fileList
        });
    };

    //upload button icon
    const uploadButton = () => {
        return <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    }

    //for preview cancel
    const handleModalCancel = () => {
        return setImageState({ ...imageState, previewVisible: false })
    }

    //render UI
    return (<div className="row">
        <div className="col-md-2">
            <AdminSideBar />
        </div>
        <div className="col-md-10">
            <MDBCard className="p-3 mt-5">
                <div className="row">
                    <div className="col-md-8">
                        {updateProductForm()}
                    </div>
                    <div className="col-md-4">
                        {uploadImageForm()}
                    </div>
                </div>
            </MDBCard>
        </div>
    </div>);
}

export default UpdateProduct;