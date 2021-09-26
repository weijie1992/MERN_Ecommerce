import React, { useState, useEffect } from "react";
import { registerFn } from "../functions/auth";
import { useSelector } from "react-redux";
// import {connect} from "react-redux";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert } from 'mdbreact';
const regexForEmail = /^[a-zA-Z0-9_]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
const Register = ({ history }) => {

    const user = useSelector((state) => {
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
        console.log("here1", user.email);
        if (user && user.email && user.token) {
            //redirect to home
            console.log("here2");
            roleBasedRedirect(user);
        }
    }, [user]);

    const [email, setEmail] = useState("");

    const [validEmail, setValidEmail] = useState(false);


    const registerFormEmail = () => {
        return (

            <MDBContainer className="p-5">
                <MDBRow>
                    <MDBCol md="6" className="offset-md-3">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={handleEmailSubmit}>
                                    <p className="h4 text-center py-4">Sign Up</p>
                                    <MDBInput
                                        label="Your Email"
                                        icon="envelope"
                                        group
                                        type="email"
                                        value={email}
                                        onChange={handleEmailChange}
                                        autoFocus
                                    />
                                    {
                                        email
                                        && !validEmail
                                        && (<MDBAlert color="danger">Invalid Email Address</MDBAlert>)
                                    }
                                    <MDBBtn
                                        type="submit"
                                        gradient="tempting-azure" rounded block
                                        disabled={!validEmail}>
                                        Sign Up with Email
                                    </MDBBtn>
                                </form>
                            </MDBCardBody>
                        </MDBCard>
                    </MDBCol>
                </MDBRow>
            </MDBContainer>
        )
    }
    const handleEmailChange = e => {
        setEmail(e.target.value);
        setValidEmail(regexForEmail.test(e.target.value));
    }

    const handleEmailSubmit = async e => {
        e.preventDefault();
        try {
            const res = await registerFn(email);
            console.log(res);
            setEmail("");
            window.alert(res.data.message);
        } catch (err) {
            window.alert(err.response.data.error);
            if (err.response.status === 400) {
                history.push("/user/forgetPassword");
            }
        }
    }

    const registerFormPhone = () => {

    }
    //Return Layout
    return (
        registerFormEmail()
    )
};


// const mapStateToProps = state => {
//     console.log("MAP STATE TO PROPS",state);
//     return {userExist:state.user}
// }
// export default connect(mapStateToProps,{})(Register);

export default Register;