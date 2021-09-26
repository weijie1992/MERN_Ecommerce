import React, { useState } from "react";
import UserSideBar from "../../components/nav/UserSideBar";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert } from 'mdbreact';
import { updatePasswordFn } from "../../functions/user";
import { refreshTokenFn } from "../../functions/auth";
import { useDispatch, useSelector } from "react-redux";
import getRefreshToken from "../../helper/getRefreshToken";
let validationSet = new Set();
let validationArr = [];
// const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,64})");
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})");

const UpdatePassword = ({ history }) => {

    const user = useSelector((state) => {
        return state.user;
    });

    const dispatch = useDispatch();

    const [validations, setValidations] = useState([]);
    const [formData, setFormData] = useState({
        currentPassword: "",
        password1: "",
        password2: ""
    });
    const [updatePasswordError, setUpdatePasswordError] = useState("");
    const { currentPassword, password1, password2 } = formData;

    const handleChange = text => e => {
        setFormData({ ...formData, [text]: e.target.value });

        if (!passwordRegex.test(e.target.value)) {
            validationSet.add("Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character");

        } else {
            validationSet.delete("Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character");
        }

        if (text === "password1") {
            if (e.target.value !== password2) {
                validationSet.add("Password and confirm Password don't match");
            } else {
                validationSet.delete("Password and confirm Password don't match");
            }
        }
        if (text === "password2") {
            if (e.target.value !== password1) {
                validationSet.add("Password and confirm Password don't match");
            } else {
                validationSet.delete("Password and confirm Password don't match");
            }
        }

        validationArr = [...validationSet];

        setValidations(validationArr);
    }
    // //get Refresh Token from local storage
    // const getRefreshToken = () => {
    //     const rfAuthToken = localStorage.getItem("rfToken");
    //     if (!rfAuthToken) {
    //         localStorage.removeItem("token");
    //         localStorage.removeItem("rfToken");
    //         return null;
    //     }
    //     else {
    //         return rfAuthToken;
    //     }
    // }
    const handleSubmit = async e => {
        e.preventDefault();

        try { //first call 
            const res = await updatePasswordFn(currentPassword, password1, user.token);
            if (res.status === 200) {
                dispatch({
                    type: "LOGGED_OUT_USER"
                });
                window.alert(res.data.message);
                history.push("/login")
            }
        }
        catch (err) {
            //if jwt expired error
            if (err.response.data.error === "J01") {
                //get Refresh Token from local storage
                const rfAuthToken = getRefreshToken();
                
                if (rfAuthToken === null) { //check if refresh token exist
                    setFormData({
                        ...formData,
                        currentPassword: "",
                        password1: "",
                        password2: ""
                    });
                    setUpdatePasswordError("Session Timeout please re-login to perform action");
                }
                else { //refresh token exist, retrieve new refresh token
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        //try with new JWT
                        try {
                            
                            const res3 = await updatePasswordFn(currentPassword, password1,res2.data.token);
                            if (res3.status === 200) { //update redux if success
                                dispatch({
                                    type: "LOGGED_OUT_USER"
                                });
                                window.alert(res3.data.message);
                                history.push("/login")
                            }
                        } //if fail no more retry
                        catch (err) {
                            setFormData({
                                ...formData,
                                currentPassword: "",
                                password1: "",
                                password2: ""
                            });
                            setUpdatePasswordError("Session Timeout please re-login to perform action");
                        }
                    }
                    catch (err) {
                        setFormData({
                            ...formData,
                            currentPassword: "",
                            password1: "",
                            password2: ""
                        });
                        setUpdatePasswordError(err.response.data.error);
                    }
                }
            } else { //other errors
                setFormData({
                    ...formData,
                    currentPassword: "",
                    password1: "",
                    password2: ""
                });
                setUpdatePasswordError(err.response.data.error);
            }
        }


    }

    const changePasswordForm = () => {
        return (
            <MDBContainer className="p-5">
                <MDBRow>
                    <MDBCol md="6" className="offset-md-1">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={handleSubmit}>
                                    <p className="h4 text-center py-4">Reset Password</p>
                                    <div className="grey-text">
                                        <MDBInput
                                            label="Current Password"
                                            icon="lock"
                                            group
                                            type="password"
                                            value={currentPassword}
                                            onChange={handleChange("currentPassword")}
                                        />
                                        <MDBInput
                                            label="Password"
                                            icon="lock"
                                            group
                                            type="password"
                                            value={password1}
                                            onChange={handleChange("password1")}
                                        />
                                        <MDBInput
                                            label="Confirm Password"
                                            icon="lock"
                                            group
                                            type="password"
                                            value={password2}
                                            onChange={handleChange("password2")}
                                        />
                                    </div>
                                    {validations && validations.length > 0 && validations.map((v, i) => {
                                        return <MDBAlert key={i} className="list-group-item list-group-item-danger p-2 m-1">{v}</MDBAlert>
                                    })}
                                    {updatePasswordError && currentPassword === "" && password1 === "" && password2 === "" && <MDBAlert className="list-group-item list-group-item-danger p-2 m-1">{updatePasswordError}</MDBAlert>}
                                    <MDBBtn disabled={!(currentPassword && password1 && password2 && validations.length === 0)} gradient="tempting-azure" rounded block type="submit">
                                        Update Pasword
                                            </MDBBtn>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        )
    }

    return (
        <div className="row">
            <div className="col-md-2">
                <UserSideBar />
            </div>
            <div className="col-md-10">
                {changePasswordForm()}
            </div>
        </div>
    )
}

export default UpdatePassword;