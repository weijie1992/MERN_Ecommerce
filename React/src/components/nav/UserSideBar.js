import React from "react";
import { MDBNav, MDBNavLink, MDBRow } from "mdbreact";
const UserSideBar = () => {
    return (
        <MDBRow>
            <MDBNav className="flex-column font-weight-bold mt-5">
                <MDBNavLink className="font-weight-light text-reset" to="/user/purchaseHistory">My Purchase</MDBNavLink>
                <MDBNavLink className="font-weight-light text-reset" to="/user/profile">My Profile</MDBNavLink>
                {/* <MDBNavLink className="font-weight-light text-reset" to="/user/wishlist">My Wishlist</MDBNavLink> */}
                <MDBNavLink className="font-weight-light text-reset" to="/user/updatePassword">Update Password</MDBNavLink>
            </MDBNav>
        </MDBRow>
    )
}
export default UserSideBar;