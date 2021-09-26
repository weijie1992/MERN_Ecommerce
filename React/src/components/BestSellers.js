import React, { useState, useEffect } from "react";
import { MDBCard } from 'mdbreact';
import ProductCard from "../components/ProductCard";
import LoadingCard from "../components/LoadingCard";
import { getProductsBySearchFilterFn,getProductsCountFn } from "../functions/product";
import { useSelector } from "react-redux";
import { Pagination } from "antd";

const BestSellers = () => {
    const { user } = useSelector((state) => ({ ...state }));
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [productCount, setProductCount] = useState(0);

    const getProducts = async () => {
        setLoading(true);
        const res = await getProductsBySearchFilterFn("sold", "desc", page);
        setProducts(res.data);
        setLoading(false);
    }

    const getProductsCount = async () => {
        const res = await getProductsCountFn();
        setProductCount(res.data);
    }

    useEffect(() => {
        getProducts();
    }, [page]);

    useEffect(() => {
        getProductsCount();
    }, []);

    return (
        <>
            <MDBCard className="p-3 mt-5">
                <h4 className="text-center p-3 font-weight-bold display-4">Best Selling Fruits</h4>
                {loading ?
                    <div className="pt-5">
                        <LoadingCard
                            numOfLoadingItems={4}
                        />
                    </div> :
                    <div className="pt-5">
                        <ProductCard
                            products={products}
                            user={user}
                        />
                    </div>
                }
                <Pagination
                    className="text-center mt-3"
                    current={page}
                    defaultPageSize={4}
                    total={productCount}
                    onChange={(value) => {
                        setPage(value)
                    }}
                />
            </MDBCard>
        </>

    )
}

export default BestSellers;