import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPasswordFn, resetPasswordWithPasswordFn } from "../functions/auth";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert } from 'mdbreact';
let validationSet = new Set();
let validationArr = [];
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})");

const ResetPassword = ({ match, history }) => {

    const user = useSelector(state => {
        return state.user;
    });

    //redirect base on role
    const roleBasedRedirect = user => {
        console.log("roleBasedRedirect", user);
        if (user.role === "admin") {
            history.push("/admin/dashboard");
        }
        else if (user.role === "normal") {
            history.push("/");
        }
    }

    //Redirect if user logged in
    useEffect(() => {
        if (user && user.email && user.token) {
            //redirect
            roleBasedRedirect(user);
        }
    }, [user]);

    const dispatch = useDispatch();

    const [validations, setValidations] = useState([]);
    const [formData, setFormData] = useState({
        password1: "",
        password2: ""
    });

    const { password1, password2 } = formData;

    const resetPassword = async token => {
        try {
            const res = await resetPasswordFn(token);
            if (res.status !== 204) {
                window.alert("Reset Password Error, please try again");
                history.push("/user/forgetPassword");
            }
        } catch (err) {
            window.alert(err.response.data.error);
            history.push("/user/forgetPassword");
        }
    }

    useEffect(() => {
        const token = match.params.token;
        resetPassword(token);
    }, [])


    const resetPasswordForm = () => {
        return (
            <MDBContainer className="p-5">
                <MDBRow>
                    <MDBCol md="6" className="offset-md-3">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={handleSubmit}>
                                    <p className="h4 text-center py-4">Reset Password</p>
                                    <div className="grey-text">
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
                                    <MDBBtn disabled={!(password1 && password2 && validations.length === 0)} gradient="tempting-azure" rounded block type="submit">
                                        Reset Pasword
                                        </MDBBtn>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        )
    }

    const handleSubmit = async e => {
        e.preventDefault();
        if (password1 === password2) {
            try {
                const res = await resetPasswordWithPasswordFn(match.params.token, password1);
                //clear form data
                setFormData({
                    password1: "",
                    password2: ""
                });
                //update redux
                dispatch({
                    type: "LOGGED_IN_USER",
                    payload: res.data
                });

                //redirect to home
                roleBasedRedirect(user);

            } catch (err) {
                window.alert(err.response.data.error);
                history.push("/user/forgetPassword");
            }
        }
        else {
            window.alert("ResetPassword Error please try again");
            setFormData({
                ...formData,
                password1: "",
                password2: ""
            });
        }

    }

    const handleChange = text => e => {
        setFormData({ ...formData, [text]: e.target.value });

        if (text === "password1") {
            if (!passwordRegex.test(e.target.value)) {
                validationSet.add("Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character");

            } else {
                validationSet.delete("Password must be 8 to 64 characters, contain 1 upper, 1 lower, 1 numberic and a special character");
            }
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

    // Return Layuout
    return (
        resetPasswordForm()
    )
}

export default ResetPassword;