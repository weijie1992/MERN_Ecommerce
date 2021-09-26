import React from "react";
import UserSideBar from "../../components/nav/UserSideBar";
const Wishlist = () => {
    return (
        <div className="row">
            <div className="col-md-2">
            <UserSideBar/>
            </div>
            <div className="col-md-10">
            THis is Wishlist page
            </div>
        </div>
    )
}

export default Wishlist;