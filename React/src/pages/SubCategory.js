import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { searchProductFn } from "../functions/product";
import { listSubCategoryFn } from "../functions/subCategory";
import ProductCard from "../components/ProductCard";
import { MDBCard } from "mdbreact";
import SearchSideBar from "../components/nav/SearchSideBar";

const SubCategory = ({ match }) => {
  const slug = match.params.slug;
  let user = useSelector((state) => {
    return state.user;
  });

  const [products, setProduct] = useState([]);
  const [sortBy, setSortBy] = useState("topSales");
  const [subCategories, setSubCategories] = useState([]);
  const [price, setPrice] = useState({ min: 0, max: 0 });
  const [priceError, setPriceError] = useState("");
  const [starSelected, setStarSelected] = useState(0);
  const [shippingProviders, setShippingProviders] = useState([]);

  //If user manually type on the URL, make sure backend is call to fetch the result
  useEffect(() => {
    getSubCategoryID();
  }, [slug]);

  //trigger tobackend when category, shipping provider, and sort changed
  useEffect(() => {
    searchProduct(null, sortBy, subCategories, price, shippingProviders);
  }, [sortBy, subCategories, shippingProviders]);

  //clear price, rating and shipping on subcategory change
  useEffect(() => {
    setPrice({ min: 0, max: 0 });
    setPriceError("");
    setStarSelected(0);
    setShippingProviders([]);
  }, [subCategories]);

  //get subcategory ID as slug is pass by name instead of ID.
  const getSubCategoryID = async () => {
    //   //exit function for all item
    // if (slug === "allItems") return;
    try {
      const res = await listSubCategoryFn();
      let allSubCategories = res.data;
      //if all item, set subCategories to all subcategories._id
      if (slug === "allItems") {
        let subcategoriesID = allSubCategories.map((subCategory) => {
            return subCategory._id
        });
        setSubCategories(subcategoriesID);
      } 
      //if only 1 category selected only checked the 1 category
      else {
        let defaultSubCategory = allSubCategories.filter((subCategory) => {
          return subCategory.slug === slug;
        });
        let subcategoriesID = defaultSubCategory.map((sc) => {
          return sc._id;
        });
        setSubCategories(subcategoriesID);
      }
    } catch (err) {}
  };

  const searchProduct = async (
    keyword,
    sortBy,
    subCategories,
    price,
    shippingProviders
  ) => {
    try {
      const res = await searchProductFn(
        keyword,
        sortBy,
        subCategories,
        price,
        shippingProviders
      );
      setProduct(res.data);
    } catch (err) {}
  };

  //All Search filters, by setting onchange it will trigger to useEffect which will make a call to backend and fetch new result
  const handleSortByChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSubCategories(e);
  };

  const handlePrice = async (e) => {
    setPriceError("");
    if ((price.min === 0 && price.max === 0) || price.min > price.max) {
      setPriceError("Please input valid price range");
    } else {
      try {
        searchProduct(null, sortBy, subCategories, price, shippingProviders);
      } catch (err) {}
    }
  };

  const handleStarClick = (value) => {
    console.log(value);
    setStarSelected(value);
  };

  const handleShippingProviderChange = (e) => {
    setShippingProviders(e);
  };
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
          shippingProviders={shippingProviders}
        />
      </div>
      <div className="col-md-10">
        {subCategories.length > 0 && products && products.length > 0 ? (
          <>
            <h4 className="mt-3 mb-3">{products.length} Search results</h4>
            <div>
              Sort By :{" "}
              <select
                className="custom-select w-25"
                name="SortBy"
                value={sortBy}
                onChange={handleSortByChange}
              >
                {/* <option value="relevance">Relevance</option> */}
                <option value="topSales">Top Sales</option>
                <option value="priceLowToHigh">Price Low to High</option>
                <option value="priceHighToLow">Price High to Low</option>
              </select>
            </div>

            <MDBCard className="p-3 mt-3">
              <ProductCard products={products} user={user} />
            </MDBCard>
          </>
        ) : (
          <h4 className="mt-3">No product found</h4>
        )}
      </div>
    </div>
  );
};

export default SubCategory;
