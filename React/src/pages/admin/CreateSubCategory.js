import React, { useEffect, useState } from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { MDBIcon, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter, MDBBadge } from 'mdbreact';
import { getCategoriesFn } from "../../functions/category";
import { addSubCategoryFn, listSubCategoryFn, deleteSubCategoryFn, updateSubCategoryFn } from "../../functions/subCategory";
import { useSelector, useDispatch } from "react-redux";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";

const CreateSubCategory = () => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [formData, setFormData] = useState({
        parentCategory: "",
        subCategory: ""
    });
    const { parentCategory, subCategory } = formData;

    const [updatedFormData, setUpdatedFormData] = useState({
        updatedParentCategory: "",
        updatedSubCategory: "",
        originalSlug: ""
    });
    const { updatedParentCategory, updatedSubCategory, originalSlug } = updatedFormData;

    const [response, setResponse] = useState({
        message: "",
        css: "",
    });
    const { message, css } = response;
    const [modalState, setModalState] = useState(false);



    const getCategories = async () => {
        const res = await getCategoriesFn();
        setCategories(res.data);
    }
    const getSubCategories = async () => {
        const res = await listSubCategoryFn();
        setSubCategories(res.data);
    }
    useEffect(() => {
        getCategories();
        getSubCategories();
    }, []);
    const createSubCategoryForm = () => {
        return (<form onSubmit={handleSubmit}>
            <MDBCol><p className="h4 py-4">SubCategory</p></MDBCol>
            <select className="browser-default custom-select w-50" name="parentCategory" onChange={handleChange} value={parentCategory}>
                <option value="">Choose you option</option>
                {categories.map(category => {
                    return <option
                        key={category._id}
                        value={category._id}>
                        {category.name}
                    </option>
                })}
            </select>
            <MDBInput
                label="Sub Category Name"
                outline
                className="w-50"
                type="text"
                name="subCategory"
                value={subCategory}
                onChange={handleChange}
                autoFocus
            />
            <MDBRow>
                <MDBCol size="4" ><MDBBtn color="light" disabled={!(subCategory && parentCategory)} type="submit">Create SubCategory</MDBBtn></MDBCol>
               
                    <MDBAlert color={css}>{message}</MDBAlert>
                
            </MDBRow>
        </form>)
    }

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await addSubCategoryFn(subCategory, parentCategory, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            setFormData({
                parentCategory: "",
                subCategory: ""
            });
            getSubCategories();//render subcategories
        }
        catch (err) {
            if (err.response.data.error === "J01") { //retry once
                //get Refresh Token from local storage
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken) {
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        const res3 = await addSubCategoryFn(subCategory, parentCategory, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        setFormData({
                            parentCategory: "",
                            subCategory: ""
                        });
                        getSubCategories();//render subcategories
                    } catch (err) {//fail second time
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                } else { //No auth Token
                    setResponse({ ...response, message: err.response.data.error, css: "danger" });
                }
            } else { //fail not because of auth token
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
    }

    const handleChange = e => {
        setFormData(
            { ...formData, [e.target.name]: e.target.value }
        );
    }

    const displaySubCategoriesCard = () => {
        return (
            <MDBRow>
                {subCategories.filter(sc1 => { return sc1.name.includes(subCategory) }).map((sc2) => {
                    return (
                        <MDBCol md="4" key={sc2._id}>
                            <MDBAlert color="secondary">
                                <div className="font-italic font-weight-lighter small-font">{sc2.parentCategory.name}</div>
                                {sc2.name}
                                <MDBIcon
                                    onClick={() => handleSubCategoryDelete(sc2.slug)}
                                    className="float-right pt-1 text-danger"
                                    style={{ cursor: 'pointer' }}
                                    far
                                    icon="trash-alt" />

                                <MDBIcon className="float-right pt-1 pr-3 text-warning"
                                    style={{ cursor: 'pointer' }}
                                    far
                                    icon="edit"
                                    onClick={() => handleToggleOpen(sc2)}
                                />
                                <br />
                            </MDBAlert>
                            <MDBModal isOpen={modalState} toggle={handleToggleClose} modalStyle="warning" backdrop={false}>
                                <MDBModalHeader toggle={handleToggleClose}>Update Subcategory</MDBModalHeader>
                                <MDBModalBody>
                                    <select className="browser-default custom-select" name="updatedParentCategory" onChange={e => setUpdatedFormData({ ...updatedFormData, [e.target.name]: e.target.value })} value={updatedParentCategory}>

                                        {categories.map(category2 => {
                                            return <option
                                                key={category2._id}
                                                value={category2._id}>
                                                {category2.name}
                                            </option>
                                        })}
                                    </select>

                                    <MDBInput
                                        label="Subcategory Name"
                                        outline
                                        type="text"
                                        value={updatedSubCategory}
                                        name="updatedSubCategory"
                                        onChange={e => setUpdatedFormData({ ...updatedFormData, [e.target.name]: e.target.value })}
                                        autoFocus
                                    />
                                </MDBModalBody>
                                <MDBModalFooter>
                                    <MDBBtn color="danger" onClick={handleToggleClose}>Close</MDBBtn>
                                    <MDBBtn color="success" onClick={handleUpdate}>Save changes</MDBBtn>
                                </MDBModalFooter>
                            </MDBModal>

                        </MDBCol>
                    )
                })}
            </MDBRow>
        )
    }// End displaySubCategoriesCard

    const handleSubCategoryDelete = async subCategorySlug => {
        try {
            const res = await deleteSubCategoryFn(subCategorySlug, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            getSubCategories();//render sub categories

        }
        catch (err) {
            if (err.response.data.error === "J01") { //retry once
                //get Refresh Token from local storage
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken) {
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        const res3 = await deleteSubCategoryFn(subCategorySlug, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        getSubCategories();//render sub categories
                    }
                    catch (err) {
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                }
            } else {
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
    }//End handleSubCategoryDelete

    const handleToggleOpen = sc => {
        setModalState(!modalState);
        setUpdatedFormData({ ...updatedFormData, updatedParentCategory: sc.parentCategory._id, updatedSubCategory: sc.name, originalSlug: sc.slug })
    }
    const handleToggleClose = () => {
        setModalState(!modalState);
    }

    const handleUpdate = async () => {
        try {
            const res = await updateSubCategoryFn(originalSlug, updatedFormData, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            getSubCategories(); //reload components
        }
        catch (err) {
            if (err.response.data.error === "J01") { //retry once
                //get Refresh Token from local storage
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken) {
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        const res3 = await updateSubCategoryFn(originalSlug, updatedFormData, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        getSubCategories(); //reload components
                    }
                    catch (err) {
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                } else {
                    setResponse({ ...response, message: err.response.data.error, css: "danger" });
                }
            } else {
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
        setModalState(!modalState);
    }

    //render UI
    return (<div className="row">
        <div className="col-md-2">
            <AdminSideBar />
        </div>
        <div className="col-md-10">
            <MDBCard className="p-3 mt-5">
                {createSubCategoryForm()}

                <hr />
                {/* {JSON.stringify(subCategories)} */}
                {/* <FilterQuery searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
                {/* { searchInput()} */}
                <MDBCardBody cascade className="center">
                    {displaySubCategoriesCard()}
                </MDBCardBody>
            </MDBCard>
        </div>
    </div>);
}
export default CreateSubCategory;