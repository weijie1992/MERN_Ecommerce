import React, { useState, useEffect } from "react";
import AdminSideBar from "../../components/nav/AdminSideBar";
import { MDBIcon, MDBCard } from 'mdbreact';
import { getProductsFn, deleteProductFn } from "../../functions/product";
import { useSelector, useDispatch } from "react-redux";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from "react-router-dom";
import ProductCard from "../../components/ProductCard";


const ViewAllProduct = ({ history }) => {
    const user = useSelector(state => state.user);
    const dispatch = useDispatch();
    const [products, setProducts] = useState([]);
    const getProducts = async () => {
        const res = await getProductsFn();
        setProducts(res.data);
    }
    const [response, setResponse] = useState({
        message: "",
        css: "",
    });

    // const [showToast, setShowToast] = useState(false);

    //load all products
    useEffect(() => {
        getProducts();
    }, []);

    //handleDelete
    const handleDelete = async (slug) => {
        try {
            const res = await deleteProductFn(slug, user.token);
            setResponse({ ...response, message: res.data, css: "success" });
            // setShowToast(true);
            console.log(res);
            toast.success(res.data);
            getProducts();//render products
        } catch (err) {
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
                        const res3 = await deleteProductFn(slug, res2.data.token);
                        setResponse({ ...response, message: res3.data, css: "success" });
                        toast.success(res3.data);
                        getProducts();//render products
                    } catch (err) {//fail second time
                        setResponse({ ...response, message: err.response.data.error, css: "danger" });
                        toast.error(err.response.data.error);
                    }
                } else { //No auth Token
                    setResponse({ ...response, message: err.response.data.error, css: "danger" });
                    toast.error(err.response.data.error);
                }
            } else { //fail not because of auth token
                setResponse({ ...response, message: err.response.data.error, css: "danger" });
                toast.error(err.response.data.error);
            }
        }
    }
    //handleEdit
    const handleEdit = async slug => {
        history.push("")
    }

    const ViewAllProductForm = () => {
        return (
            <ProductCard
                handleDelete={handleDelete}
                products={products}
                user={user}
            />
            // <div className="row"
            // >
            //     {products.map(p => {
            //         return (
            //             <div className="col-md-3 mb-3 d-flex align-items-stretch" key={p._id}>
            //                 <div className="card pb-2" >
            //                     <div className="view overlay">
            //                         {/* image here */}
            //                         <img
            //                             // style={{ height: '10rem' }} 
            //                             src={`${process.env.REACT_APP_AWSS3DIR}/${p.images[0]}`} className="card-img-top" alt="">
            //                         </img>
            //                         <div className="card-body">
            //                             <div className="font-weight-bolder">
            //                                 {p.name}
            //                             </div>
            //                             <div className="deep-orange-text">
            //                                 ${p.price}
            //                             </div>
            //                             <div className="font-weight-light" style={{ fontSize: "12px" }}>
            //                                 {p.description && p.description.length > 30 ? `${p.description.substring(0, 30)}...` : p.description}
            //                             </div>
            //                             <div className="mt-1">
            //                                 <span className="float-left mr-2 block"><MDBIcon far icon="heart" /></span>
            //                                 <span className="block ml-3"><MDBIcon far icon="star" /><MDBIcon far icon="star" /><MDBIcon far icon="star" /><MDBIcon far icon="star" /><MDBIcon far icon="star" /></span>
            //                                 <span className="float-right block mt-1" style={{ fontSize: "13px" }}>{p.sold} sold</span>
            //                             </div>
            //                             <div className="mt-1">
            //                                 <MDBIcon
            //                                     onClick={() => handleDelete(p.slug)}
            //                                     className="float-right pt-1 text-danger"
            //                                     style={{ cursor: 'pointer' }}
            //                                     far
            //                                     icon="trash-alt" />

            //                                 <Link to={`/admin/updateProduct/${p.slug}`}>
            //                                     <MDBIcon className="float-right pt-1 pr-3 text-warning"
            //                                         style={{ cursor: 'pointer' }}
            //                                         far
            //                                         icon="edit"
            //                                     // onClick={() => handleEdit(p.slug)}
            //                                     />
            //                                 </Link>
            //                             </div>
            //                         </div>
            //                     </div>
            //                 </div>
            //             </div>
            //         )
            //     })}
            // </div>
        )
    }

    //render UI
    return (
        <div className="row">
            <div className="col-md-2">
                <AdminSideBar />
            </div>
            <div className="col-md-10">
                <div className="row pl-3 pt-2 pb-2 mt-3">
                    <h4>All Products</h4>
                </div>
                {ViewAllProductForm()}
            </div>
        </div>
    );
}

export default ViewAllProduct;