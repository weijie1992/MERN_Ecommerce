import React, { useState, useEffect } from "react";
import Logo from "../../Images/FF.png";
import { Link, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import { logoutFn } from "../../functions/auth";
import { listSubCategoriesByCategoryFn } from "../../functions/subCategory";
import { getCategoriesFn } from "../../functions/category";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import { Badge, Menu } from "antd";
import {
  UserOutlined,
  UserAddOutlined,
  ShoppingOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import SearchQuery from "../SearchQuery";

const { SubMenu } = Menu;

const Header = () => {
  const history = useHistory();
  //get user and cart state from redux
  const { user, cart } = useSelector((state) => {
    return { ...state };
  });

  const dispatch = useDispatch();

  const [currentSelected, setCurrentSelected] = useState();

  const [shopItem, setShopItem] = useState([]);

  const getShopItem = async () => {
    const res = await getCategoriesFn();
    let categoriesObj = {};
    let categoriesArray = [];
    let categories = res.data;
    for (let i = 0; i < categories.length; i++) {
      const res2 = await listSubCategoriesByCategoryFn(categories[i]._id);
      let subcategories = res2.data;
      categoriesObj = { ...categories[i] };
      categoriesObj.subcategories = subcategories;
      categoriesArray.push(categoriesObj);
      categoriesObj = {};
    }
    setShopItem(categoriesArray);
  };
  useEffect(() => {
    getShopItem();
  }, []);

  const handleLogout = async () => {
    const rfToken = localStorage.getItem("rfToken");
    console.log(rfToken);
    try {
      await logoutFn(rfToken);
      dispatch({
        type: "LOGGED_OUT_USER",
      });
      history.push("/login");
    } catch (err) {
      //if somehow logout have error still proceed to remove from local storage
      console.log("4");
      localStorage.removeItem("token");
      localStorage.removeItem("rfToken");
      history.push("/login");
    }
  };
  const antMenu = () => {
    return (
      <Menu
        selectedKeys={[currentSelected]}
        mode="horizontal"
        className="stickyHeader"
        style={{ backgroundColor: "#f3fabb" }}
      >
        <Menu.Item className="removeUnderlineHover" key="logo">
          <Link to="/">
            <img
              src={Logo}
              alt="MumsCookyLogo"
              style={{ height: "60px", objectFit: "cover" }}
            />
          </Link>
        </Menu.Item>
        <SubMenu
          key="shop"
          className="removeUnderlineHover"
          icon={<ShoppingOutlined />}
          title="Shop"
        >
          {shopItem && shopItem.length > 0 && (
            <Menu.Item key="AllItem">
              <Link to={`/subcategory/allItems`}>All Items</Link>
            </Menu.Item>
          )}
          {shopItem.map((si) => {
            return (
              <Menu.ItemGroup title={si.name} key={si._id}>
                {si.subcategories.map((subsi) => {
                  return (
                    <Menu.Item key={subsi._id}>
                      <Link to={`/subcategory/${subsi.slug}`}>
                        {subsi.name}
                      </Link>
                    </Menu.Item>
                  );
                })}
              </Menu.ItemGroup>
            );
          })}
        </SubMenu>

        {user && user.token && (
          <SubMenu
            className="float-right mt-3 removeUnderlineHover"
            key="username"
            icon={<UserOutlined />}
            title={user.name || user.email}
          >
            {user && user.role === "admin" && (
              <Menu.Item key="AdminDashboard">
                <Link
                  style={{ textDecoration: "none", active: "pink" }}
                  to="/admin/dashboard"
                >
                  Admin Dashboard
                </Link>
              </Menu.Item>
            )}
            <Menu.Item key="MyAccount">
              <Link
                style={{ textDecoration: "none", active: "pink" }}
                to="/user/profile"
              >
                My Account
              </Link>
            </Menu.Item>
            <Menu.Item key="MyPurchase">
              <Link
                style={{ textDecoration: "none", active: "pink" }}
                to="/user/purchaseHistory?status=all"
              >
                My Purchase
              </Link>
            </Menu.Item>
            {/* <Menu.Item key="MyWishlist">
              <Link
                style={{ textDecoration: "none", active: "pink" }}
                to="/user/wishlist"
              >
                My Wishlist
              </Link>
            </Menu.Item> */}

            <Menu.Item key="Logout" onClick={handleLogout}>
              Logout
            </Menu.Item>
          </SubMenu>
        )}

        {user.token === null && (
          <>
            <Menu.Item
              className="float-right mt-3 removeUnderlineHover"
              key="register"
              icon={<UserAddOutlined />}
            >
              <Link
                to="/register"
                style={{ textDecoration: "none", active: "pink" }}
              >
                Register
              </Link>
            </Menu.Item>
            <Menu.Item
              className="float-right mt-3 removeUnderlineHover"
              key="login"
              icon={<UserOutlined />}
            >
              <Link
                to="/login"
                style={{ textDecoration: "none", active: "pink" }}
              >
                Login
              </Link>
            </Menu.Item>
          </>
        )}

        <Menu.Item
          className="float-right mt-3 removeUnderlineHover"
          key="cart"
          // icon={<ShoppingCartOutlined />}
        >
          <Link to="/cart">
            <Badge count={cart.length}>
              <ShoppingCartOutlined />
            </Badge>
          </Link>
        </Menu.Item>

        <Menu.Item className="float-right mt-3 removeUnderlineHover">
          <SearchQuery />
        </Menu.Item>
      </Menu>
    );
  };

  //Return Layout
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      {antMenu()}
    </>
  );
};

export default Header;
