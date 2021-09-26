import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { searchProductFn } from "../functions/product";
import ProductCard from "../components/ProductCard";
import { MDBCard } from 'mdbreact';
import SearchSideBar from "../components/nav/SearchSideBar";

const Search = () => {
    //grep redux search keyword
    let keyword = useSelector(state => {
        return state.search.keyword;
    });
   //grep redux user
    let user = useSelector(state=> {
        return state.user;
    })

    const [products, setProduct] = useState([]);
    const [sortBy, setSortBy] = useState("relevance");
    const [subCategories,setSubCategories] = useState([]);
    const [price, setPrice] = useState({min:0,max:0});
    const [priceError, setPriceError] = useState("");
    const [starSelected, setStarSelected] = useState(0);
    const [shippingProviders,setShippingProviders] = useState([]);

    //clear filter when search keyword changed
    useEffect(()=> {
        setSubCategories([]);
        setPrice({min:0,max:0});
        setStarSelected(0);
        setShippingProviders([]);
    },[keyword]);

    //settimeout 300ms so that not every keyword type will send a request to backend
    useEffect(() => {
        const delay = setTimeout(() => {
            searchProduct(keyword, sortBy, subCategories, price, shippingProviders);
        }, 300);
        return () => clearTimeout(delay);
    }, [keyword, sortBy, subCategories, shippingProviders]);

    const searchProduct = async (keyword, sortBy, subCategories, price, shippingProviders) => {
        try {
            const res = await searchProductFn(keyword, sortBy, subCategories, price, shippingProviders);
            setProduct(res.data);
        } catch (err) {
        }
    }

    //All Search filters, by setting onchange it will trigger to useEffect which will make a call to backend and fetch new result
    const handleSortByChange = e  => {
        setSortBy(e.target.value);
    }

    const handleCategoryChange = e => {
        setSubCategories(e);
    }

    const handlePrice =async e => {
        setPriceError("");
        if( (price.min === 0 && price.max === 0) || (price.min > price.max) ) {
            setPriceError("Please input valid price range");
        } else {
            try {
                searchProduct(keyword,sortBy,subCategories,price, shippingProviders);
                
            } catch (err) {
                
            }
        }
    }
    //todo pirority 2
    const handleStarClick = value => {
        console.log(value);
        setStarSelected(value);
    }

    const handleShippingProviderChange = e => {
        setShippingProviders(e);
    }
    //End Handle Search
    

    return (
            <div className="row">
                <div className="col-md-2">
                    <SearchSideBar 
                        subCategories={subCategories}
                        handleCategoryChange={handleCategoryChange}
                        handlePrice={handlePrice}
                        price={price}
                        setPrice={setPrice}
                        priceError={priceError}
                        setPriceError={setPriceError}
                        handleStarClick={handleStarClick}
                        starSelected={starSelected}
                        handleShippingProviderChange={handleShippingProviderChange}
                        shippingProviders = {shippingProviders}
                    />
                </div>
                <div className="col-md-10">
                {
                products && products.length > 0 ?
                            (
                                <>
                                    <h4 className="mt-3 mb-3">{products.length} Search results for '{keyword}'</h4>
                                    <div>Sort By : <select
                                        className="custom-select w-25"
                                        name="SortBy"
                                        value={sortBy}
                                        onChange={handleSortByChange}
                                        
                                    >
                                        <option value="relevance">Relevance</option>
                                        <option value="topSales">Top Sales</option>
                                        <option value="priceLowToHigh">Price Low to High</option>
                                        <option value="priceHighToLow">Price High to Low</option>
                                    </select>
                                    </div>
                                    
                                    <MDBCard className="p-3 mt-3">
                                        <ProductCard
                                            products={products}
                                            user={user}
                                        />
                                    </MDBCard>
                                </>
                            ) : (<h4 className="mt-3">No product found for '{keyword}'</h4>)
                }
                </div>
            </div>
    )
};

export default Search;