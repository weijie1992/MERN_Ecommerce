import React, { useState, useEffect } from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { MDBIcon, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert, MDBModal, MDBModalHeader, MDBModalBody, MDBModalFooter } from 'mdbreact';
import { addCategoryFn, getCategoriesFn, deleteCategoryFn, updateCategoryFn } from "../../functions/category";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
import { useDispatch, useSelector } from "react-redux";
// import FilterQuery from "../../components/FilterQuery";


const CreateCategory = () => {

    const user = useSelector((state) => {
        return state.user;
    });

    const dispatch = useDispatch();

    const [categoryName, setCategoryName] = useState("");
    const [categories, setCategories] = useState([]);
    const [response, setResponse] = useState({
        message: "",
        css: "",
    });
    const { message, css } = response;
    const [modalState, setModalState] = useState(false);
    const [updatedCategory, setUpdatedCategory] = useState({
        name: "",
        slug: ""
    });

    const getCategories = async () => {
        const res = await getCategoriesFn();
        setCategories(res.data);
    }
    useEffect(() => {
        getCategories();
    }, []);

    const createCategoryForm = () => {
        return (
            <form onSubmit={handleSubmit}>
                <MDBCol><p className="h4 py-4">Category</p></MDBCol>

                <MDBInput
                    label="Category Name"
                    outline
                    className="w-50"
                    type="text"
                    value={categoryName}
                    onChange={e => setCategoryName(e.target.value)}
                    autoFocus
                />
                <MDBRow>
                    <MDBCol size="4" ><MDBBtn color="light" disabled={!categoryName} type="submit">Create Category</MDBBtn></MDBCol>

                    <MDBAlert color={css}>{message}</MDBAlert>

                </MDBRow>
            </form>
        )
    }


    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await addCategoryFn(categoryName, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            setCategoryName("");
            getCategories();//render categories
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
                        const res3 = await addCategoryFn(categoryName, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        setCategoryName("");
                        getCategories();//render categories
                    }
                    catch (err) {//fail second time
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                } else { //No auth Token
                    setResponse({ ...response, message: err.response.data.error, css: "danger" });
                }
            }
            else { //fail not because of auth token
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
    }

    const displayCategoriesCard = () => {
        return (
            <MDBRow>
                {categories.filter(c1 => { return c1.name.includes(categoryName) }).map((c2) => {
                    return (
                        <MDBCol md="4" key={c2._id}>
                            <MDBAlert
                                color="secondary"
                            >{c2.name}
                                <MDBIcon
                                    onClick={() => handleCategoryDelete(c2.slug)}
                                    className="float-right pt-1 text-danger"
                                    style={{ cursor: 'pointer' }}
                                    far
                                    icon="trash-alt" />

                                <MDBIcon className="float-right pt-1 pr-3 text-warning"
                                    style={{ cursor: 'pointer' }}
                                    far
                                    icon="edit"
                                    onClick={() => handleToggleOpen(c2)}
                                />
                                <MDBModal isOpen={modalState} toggle={handleToggleClose} modalStyle="warning" backdrop={false}>
                                    <MDBModalHeader toggle={handleToggleClose}>Update Category</MDBModalHeader>
                                    <MDBModalBody>
                                        <MDBInput
                                            label="Category Name"
                                            outline
                                            type="text"
                                            value={updatedCategory.name}
                                            onChange={e => setUpdatedCategory({ ...updatedCategory, name: e.target.value })}
                                            autoFocus
                                        />
                                    </MDBModalBody>
                                    <MDBModalFooter>
                                        <MDBBtn color="danger" onClick={handleToggleClose}>Close</MDBBtn>
                                        <MDBBtn color="success" onClick={handleUpdate}>Save changes</MDBBtn>
                                    </MDBModalFooter>
                                </MDBModal>
                            </MDBAlert>
                        </MDBCol>
                    )
                })}
            </MDBRow>
        )
    }

    const handleCategoryDelete = async categorySlug => {
        try {
            const res = await deleteCategoryFn(categorySlug, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            getCategories();//render categories

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
                        const res3 = await deleteCategoryFn(categorySlug, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        getCategories();//render categories
                    }
                    catch (err) {
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    }
                }
            } else {
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
            }
        }
    }
    const handleToggleOpen = c => {
        setModalState(!modalState);
        setUpdatedCategory({ ...updatedCategory, name: c.name, slug: c.slug })
    }
    const handleToggleClose = () => {
        setModalState(!modalState);
    }

    const handleUpdate = async () => {
        try {
            const res = await updateCategoryFn(updatedCategory.name, updatedCategory.slug, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            getCategories(); //reload components
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
                        const res3 = await updateCategoryFn(updatedCategory.name, updatedCategory.slug, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        getCategories(); //reload components
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
                {createCategoryForm()}
                <hr />
                {/* <FilterQuery searchQuery={searchQuery} setSearchQuery={setSearchQuery} /> */}
                {/* { searchInput()} */}
                <MDBCardBody cascade className="center">
                    {displayCategoriesCard()}
                </MDBCardBody>
            </MDBCard>
        </div>
    </div>);
}

export default CreateCategory;