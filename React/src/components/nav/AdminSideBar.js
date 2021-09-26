import React from "react";
import { MDBNav, MDBNavLink, MDBRow } from "mdbreact";
const AdminSideBar = () => {
    return (
        <MDBRow>
            <MDBNav className="flex-column font-weight-bold mt-5">
                <MDBNavLink className="font-weight-light text-reset" to="/admin/dashboard">Admin Dashboard</MDBNavLink>
                <MDBNavLink className="font-weight-light text-reset" to="/admin/createProduct">Create Product</MDBNavLink>
                <MDBNavLink className="font-weight-light text-reset" to="/admin/viewAllProducts">View All Products</MDBNavLink>
                <MDBNavLink className="font-weight-light text-reset" to="/admin/createCategory">Create Category</MDBNavLink>
                <MDBNavLink className="font-weight-light text-reset" to="/admin/createSubCategory">Create Sub Category</MDBNavLink>
            </MDBNav>
        </MDBRow>
    )
}
export default AdminSideBar;