import React, { useEffect, useState } from "react";
import { listSubCategoryFn } from "../../functions/subCategory";
import { Checkbox } from 'antd';
import StarRatings from "react-star-ratings";
import {shippingProvidersFn} from "../../functions/shipping";

const SearchSideBar = ({ subCategories, handleCategoryChange, handlePrice, price, setPrice, priceError, handleStarClick, starSelected,handleShippingProviderChange, shippingProviders }) => {
    const [displaySubCategories, setDisplaySubCategories] = useState([]);
    const [displayShippingProviders, setDisplayShippingProviders] = useState([]);

    const listSubCategory = async () => {
        const res = await listSubCategoryFn();
        setDisplaySubCategories(res.data);
    }

    const listShippingProvider = async () => {
        const res = await shippingProvidersFn();
        setDisplayShippingProviders(res.data);
    }

    useEffect(() => {
        listSubCategory();
        listShippingProvider();
    }, []);

    const displayCategories = () => {
        const options = displaySubCategories.map(subcategory => {
            return {
                label: subcategory.name,
                value: subcategory._id
            }
        });
        return (<Checkbox.Group options={options} value={subCategories} onChange={handleCategoryChange}></Checkbox.Group>);
    }


    const displayPriceRange = () => {
        return (
            <>
                <input
                    className="form-control-sm mr-sm-2"
                    style={{ width: "40%" }}
                    type="number"
                    min={0}
                    placeholder="Min"
                    value={price.min === 0 && price.max === 0 ? "" : price.min}
                    onChange={e => {
                        console.log(price);
                        console.log(e);
                        setPrice({
                            ...price,
                            min: e.target.value
                        })
                    }}
                />
             -
                <input
                    className="form-control-sm mr-sm-2 float-right"
                    style={{ width: "40%" }}
                    type="number"
                    min={0}
                    placeholder="Max"
                    value={price.min === 0 && price.max === 0 ? "" : price.max}
                    onChange={e => {
                        setPrice({
                            ...price,
                            max: e.target.value
                        })
                    }}
                />
                {priceError && <p className="text-danger" style={{fontSize:"11px"}}>{priceError}</p>}
                <button type="button" className="btn btn-warning btn-sm btn-block" onClick={handlePrice}>Apply</button>
            </>
        );
    }

    

    // const displayStarRating = (numOfStars) => {
    //     return (
    //         <StarRatings
    //             rating={numOfStars}
    //             starRatedColor="orange"
    //             numberOfStars={numOfStars}
    //             starSpacing="2px"
    //             starDimension="20px"
    //         />
    //     )
    // }

    const displayShippingCheckBox = () => {
        const options = displayShippingProviders.map(shippingProvider=>{
            return {
                label:shippingProvider.name,
                value:shippingProvider._id
            }
        });
        return (<Checkbox.Group options={options} value={shippingProviders} onChange={handleShippingProviderChange}></Checkbox.Group>);
    }

    return (
        <div className="mt-3">
            <h5>Search Filter</h5>
            <p>Category:</p>
            {displayCategories()}
            <hr />
            <p>Price Range:</p>
            {displayPriceRange()}
            {/* <hr />
            <p className="mb-1">Rating</p>
            
            {[5, 4, 3, 2, 1].map(eachStar => {
                let selectedStarBG = "";
                if(starSelected===eachStar) {
                    selectedStarBG = "grey";
                }
                return <div key={eachStar}><span>
                    <a
                        onClick={() => handleStarClick(eachStar)}
                        className="pb-1"
                        style={{
                            cursor: "pointer",
                            backgroundColor: selectedStarBG
                        }}>
                        {displayStarRating(eachStar)}
                    </a>
                </span></div>
            })} */}
            <hr />
            <p>Shipping</p>
            {displayShippingCheckBox()}
        </div>
    )
}

export default SearchSideBar;