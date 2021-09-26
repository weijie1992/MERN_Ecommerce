import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { activateAccountFn, activateAccountWithPasswordFn } from "../functions/auth";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert } from 'mdbreact';

let validationSet = new Set();
let validationArr = [];
const passwordRegex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})");

const UserActivate = ({ match, history }) => {

    const user = useSelector((state) => {
        return state.user;
    });

    //redirect base on role
    const roleBasedRedirect = user => {
        if (user.role === "admin") {
            history.push("/admin/dashboard");
        }
        else if (user.role === "normal") {
            history.push("/");
        }
    }

    const dispatch = useDispatch();

    const [validations, setValidations] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        password1: "",
        password2: ""
    });
    const { name, password1, password2 } = formData;

    //Redirect if user logged in
    useEffect(() => {
        console.log("here1", user.email);
        if (user && user.email && user.token) {
            //redirect to home
            roleBasedRedirect(user);
        }
    }, [user]);
    const activateAccount = async (token) => {
        try {
            const res = await activateAccountFn(token);
            if (res.status !== 204) {
                window.alert("Registration Error please try again");
                history.push("/register");
            }
        }
        catch (err) {
            window.alert(err.response.data.error);
            history.push("/register");
        }
    }
    //if user fail to activate token within 15mins
    useEffect(() => {
        const token = match.params.token;
        activateAccount(token);
    }, []);

    const handleChange = text => e => {
        setFormData({ ...formData, [text]: e.target.value });

        if (text === "name") {
            if (e.target.value.length < 2 || e.target.value.length > 64) {
                validationSet.add("Name must be between 2 to 64 characters");
            } else {
                validationSet.delete("Name must be between 2 to 64 characters");
            }
        }

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

    const handleSubmit = async e => {
        e.preventDefault();
        if (password1 === password2) {
            try {
                const res = await activateAccountWithPasswordFn(match.params.token, name, password1);
                //clear form data
                setFormData({
                    name: "",
                    password1: "",
                    password2: ""
                });
                //update redux
                dispatch({
                    type: "LOGGED_IN_USER",
                    payload: res.data
                });

                //redirect
                roleBasedRedirect(res.data);

            } catch (err) {
                window.alert(err.response.data.error);
                history.push("/register");
            }
        }
        else {
            window.alert("Registration Error please try again");
            setFormData({
                ...formData,
                password1: "",
                password2: ""
            });

        }

    }
    
    const registerWithPassword = () => {
        return (
            <MDBContainer className="p-5">
                <MDBRow>
                    <MDBCol md="6" className="offset-md-3">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={handleSubmit}>
                                    <div className="grey-text">
                                        <MDBInput
                                            label="Your Name"
                                            icon="user"
                                            group
                                            type="text"
                                            value={name}
                                            onChange={handleChange("name")}
                                            autoFocus
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
                                    <div className="text-center py-2">
                                        <MDBBtn
                                            type="submit"
                                            gradient="tempting-azure" rounded block
                                            disabled={!(name && password1 && password2 && validations.length === 0)}>
                                            Complete Registration
                                            </MDBBtn>
                                    </div>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        )
    }

    //Return Layout
    return (
        registerWithPassword()
    )
}

export default UserActivate;