import React, { useEffect, useState } from "react";
import { getProductFn, getRelatedProductsFn } from "../functions/product";
import {
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBCard,
  MDBAlert,
  MDBIcon,
} from "mdbreact";
import { Link } from "react-router-dom";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import { Image, Modal } from "antd";
import ProductCard from "../components/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { addToCartFn } from "../functions/cart";
import getRefreshToken from "../helper/getRefreshToken";
import { refreshTokenFn } from "../functions/auth";

//Initial State for form data to Server
const initialState = {
  _id: "",
  name: "",
  slug: "",
  description: "",
  price: "",
  availableQuantity: "",
  sold: "",
  images: [],
  ratings: [],
  color: [],
  category: {},
  subCategories: [],
  brand: "",
  shippingProvider: [],
};
const ProductDetails = ({ match }) => {
  const { user, cart } = useSelector((state) => {
    return { ...state };
  });

  const dispatch = useDispatch();

  const [product, setProduct] = useState(initialState);
  const {
    _id,
    name,
    slug,
    description,
    price,
    availableQuantity,
    sold,
    images,
    ratings,
    color,
    category,
    subCategories,
    brand,
    shippingProvider,
  } = product;
  const [relatedProducts, setRelatedProducts] = useState([]);
  const {
    relatedName,
    relatedDescription,
    relatedPrice,
    relatedAvailableQuantity,
    relatedSold,
    relatedImages,
    relatedRatings,
    relatedColor,
    relatedCategory,
    relatedSubCategories,
    relatedBrand,
    relatedShippingProvider,
  } = relatedProducts;
  const [errorDetails, setErrorDetails] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [visible, setVisible] = useState(false);
  const [largeImages, setLargeImages] = useState(false);
  //get current product data
  const getProduct = async () => {
    try {
      const res = await getProductFn(match.params.slug);
      //only retrieve IDs for subcategory, shipping provider which will be easier to update on backend
      setProduct((prevState) => ({
        ...prevState,
        _id: res.data._id,
        name: res.data.name,
        slug: res.data.slug,
        description: res.data.description,
        price: res.data.price,
        availableQuantity: res.data.availableQuantity,
        sold: res.data.sold,
        images: res.data.images,
        ratings: res.data.ratings,
        color: res.data.color,
        category: res.data.category,
        subCategories: res.data.subCategories,
        brand: res.data.brand,
        shippingProvider: res.data.shippingProvider,
      }));
      //Get Related Product
      getRelatedProducts(res.data._id, res.data.category._id);
    } catch (err) {
      setErrorDetails("Product Not Found");
    }
  };

  const getRelatedProducts = async (productID, categoryID) => {
    const res = await getRelatedProductsFn(productID, categoryID);
    setRelatedProducts(res.data);
  };
  //when related product was click it will scroll to top
  useEffect(() => {
    window.scrollTo(0, 0);
    getProduct();
  }, [match.params.slug]);

  const productDetailsForm = () => {
    return (
      <MDBCard className="p-2 mt-3">
        <Modal
          visible={visible}
          footer={null}
          onCancel={() => setVisible(false)}
        >
          <img alt="example" style={{ width: "100%" }} src={largeImages} />
        </Modal>
        <div className="row ml-1 mr-1">
          {errorDetails && (
            <h4 className="text-center text-danger">{errorDetails}</h4>
          )}
          <div className="col-md-6 mt-3">
            <Carousel onClickItem={handleonClickItem} swipeable={true}>
              {images &&
                images.map((image, i) => {
                  return (
                    <div
                      key={i}
                      style={{ height: "500px", objectFit: "cover" }}
                    >
                      <img src={`${process.env.REACT_APP_AWSS3DIR}/${image}`} />
                    </div>
                  );
                })}
            </Carousel>
          </div>
          <div className="col-md-6">
            <h3 className="mt-4">{name}</h3>

            <h3 className="text-danger mt-3">{price&&price.toFixed(2)}</h3>

            <div className="row mt-4">
              <div className="col-md-3">Sold:</div>
              <div className="col-md-9">{sold}</div>
            </div>

            <div className="mt-4">
              {shippingProvider &&
                shippingProvider.map((sp, i) => {
                  return (
                    <div className="row" key={sp._id}>
                      <div className="col-md-3">{i == 0 && "Shipping"}</div>
                      <div className="col-md-9">{sp.name}</div>
                    </div>
                  );
                })}
            </div>
            <div className="row mt-4">
              <div className="col-md-3">Quantity:</div>
              <div className="col-md-9 ">
                <div>
                  <input
                    type="number"
                    min={1}
                    name="quantity"
                    value={quantity}
                    onChange={(e) => {
                      let value =
                        e.target.value > availableQuantity
                          ? availableQuantity
                          : e.target.value;
                      setQuantity(parseInt(value));
                    }}
                  />
                  <span className="font-weight-light font-italic ml-3">
                    {availableQuantity} available
                  </span>
                </div>
              </div>
            </div>
            <div className="row mt-5">
              {availableQuantity && availableQuantity > 0 ? (
                <MDBBtn
                  outline
                  color="danger"
                  className="col-md-3 ml-3"
                  onClick={handleAddToCart}
                >
                  <MDBIcon icon="cart-plus" />
                  Add To Cart
                </MDBBtn>
              ) : (
                <MDBBtn
                  outline
                  color="danger"
                  className="col-md-3 ml-3"
                  disabled={true}
                >Sold Out</MDBBtn>
              )}
              <MDBBtn
                color="danger"
                className="col-md-3 ml-4 font-weight-bolder"
              >
                Buy Now
              </MDBBtn>
              {/* <MDBBtn outline color="unique" className="col-md-3 ml-4">
                <MDBIcon far icon="heart" />
                Add to WishList
              </MDBBtn> */}
            </div>
            {/* <div className="row mt-4 ">
              <div
                style={{ fontSize: "12px", color: "grey" }}
                className="col-md-3 font-weight-light"
              >
                Category:
              </div>
              <div style={{ fontSize: "12px" }} className="col-md-9">
                <Link to={`/subcategory/${category.slug}`}>{category.name}</Link>
              </div>
            </div> */}
            <div className="row mt-4">
              <div
                style={{ fontSize: "12px", color: "grey" }}
                className="col-md-3 font-weight-light"
              >
                Sub Categories:
              </div>
              <div style={{ fontSize: "12px" }} className="col-md-9">
                {subCategories.map((sc, i) => {
                  return i == 0 ? (
                    <Link to={`/subcategory/${sc.slug}`} key={i}>
                      {sc.name}
                    </Link>
                  ) : (
                    <Link to="" key={i} className="ml-3">
                      {sc.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            <MDBAlert color="secondary" className="row mt-4 h5">
              Product Description
            </MDBAlert>
            <div className="ml-1">{description}</div>
          </div>
        </div>
      </MDBCard>
    );
  };
  //enlarge image. e is the number of the carousell item
  const handleonClickItem = (e) => {
    setVisible(true);
    setLargeImages(`${process.env.REACT_APP_AWSS3DIR}/${product.images[e]}`);
  };

  //Add To Cart if user log in, add to DB, else add to local storage
  const handleAddToCart = async () => {
    if (typeof window !== "undefined") {
      //check window object
      if (user && user.email && user.token) {
        //user logged in
        let productReq = {};
        productReq.productID = product._id;
        productReq.purchaseQuantity = quantity;
        try {
          console.log("!!!!!!!!!!!!!!!!!!!here");
          const res = await addToCartFn(productReq, user.token);
          console.log(res.data);
          //add to redux store for Cart, CartModal and showModalProductReducer
          dispatch({
            type: "ADD_TO_CART",
            payload: res.data,
          });
          dispatch({
            type: "TOGGLE_CARTMODAL",
            payload: true,
          });
          dispatch({
            type: "ADD_PRODUCT_TO_MODAL",
            payload: product,
          });
          //clear quantity state
          setQuantity(1);
        } catch (err) {
          if (err.response.data.error === "J01") {
            const rfAuthToken = getRefreshToken();
            if (rfAuthToken) {
              try {
                const res2 = await refreshTokenFn(rfAuthToken);
                //update redux state
                dispatch({
                  type: "REFRESH_TOKEN",
                  payload: res2.data,
                });
                const res3 = await addToCartFn(productReq, res2.data.token);
                //add to redux store for Cart, CartModal and showModalProductReducer
                dispatch({
                  type: "ADD_TO_CART",
                  payload: res3.data,
                });
                dispatch({
                  type: "TOGGLE_CARTMODAL",
                  payload: true,
                });
                dispatch({
                  type: "ADD_PRODUCT_TO_MODAL",
                  payload: product,
                });
                //clear quantity state
                setQuantity(1);
              } catch (err) {}
            }
          } else {
            //fail not because of auth token
          }
        }
      } else {
        //user NOT logged in
        let cart = [];
        if (localStorage.getItem("cart")) {
          cart = JSON.parse(localStorage.getItem("cart"));
        }
        //add quantity to product
        product.quantity = quantity;
        //check if product exist in cart, if exist append the quantity, else push as a new array
        if (cart.length === 0) {
          cart.push({
            ...product,
          });
        } else {
          let itemExist = false;
          for (let i = 0; i < cart.length; i++) {
            if (cart[i]._id === _id) {
              cart[i].quantity += quantity;
              itemExist = true;
              break;
            }
          }
          if (!itemExist) {
            //if item not found after forloop, push to storage
            cart.push({
              ...product,
            });
          }
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        //add to redux store for Cart, CartModal and showModalProductReducer
        dispatch({
          type: "ADD_TO_CART",
          payload: cart,
        });
        dispatch({
          type: "TOGGLE_CARTMODAL",
          payload: true,
        });
        dispatch({
          type: "ADD_PRODUCT_TO_MODAL",
          payload: product,
        });
        //clear quantity state
        setQuantity(1);
      }
    }
  };

  const relatedProductsCard = () => {
    return (
      <MDBCard className="p-2 mt-3">
        <h4 className="mb-4">You May Also Like</h4>
        <ProductCard products={relatedProducts} />
      </MDBCard>
    );
  };

  return (
    <div>
      {productDetailsForm()}
      {relatedProductsCard()}
    </div>
  );
};
export default ProductDetails;
