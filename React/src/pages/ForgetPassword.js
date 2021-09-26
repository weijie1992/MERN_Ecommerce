import React, { useState, useEffect } from "react";
import { forgetPasswordFn } from "../functions/auth";
import { useSelector } from "react-redux";
import { MDBContainer, MDBRow, MDBCol, MDBInput, MDBBtn, MDBCard, MDBCardBody, MDBAlert } from 'mdbreact';
const regexForEmail = /^[a-zA-Z0-9_]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
const ForgetPassword = ({ history }) => {

    const user = useSelector(state => {
        return state.user;
    });

    //Redirect if user logged in
    useEffect(() => {
        console.log("here1", user.email);
        if (user && user.email && user.token) {
            //redirect to home
            console.log("here2");
            history.push("/");
        }
    }, [user]);

    const [email, setEmail] = useState("");

    const [validEmail, setValidEmail] = useState(false);

    const forgetPasswordForm = () => {
        return (
            <MDBContainer className="p-5">
                <MDBRow>
                    <MDBCol md="6" className="offset-md-3">
                        <MDBCard>
                            <MDBCardBody>
                                <form onSubmit={handleSubmit}>
                                    <p className="h4 text-center py-4">Forget Password</p>
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
                                        disabled={!(validEmail && email.length > 0)}>
                                        Forget Password
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
        try {
            const res = await forgetPasswordFn(email);
            setEmail("");
            window.alert(res.data.message);
        } catch (err) {
            setEmail("");
            window.alert(err.response.data.error);
        }
    }

    const handleEmailChange = e => {
        setEmail(e.target.value);
        setValidEmail(regexForEmail.test(e.target.value));
    }

    return (
        forgetPasswordForm()
        // <div className="container p-5">
        //     <div className="row">
        //         <div className="col-md-6 offset-md-3">
        //             <h4>Forget Password</h4>
        //             {forgetPasswordForm()}
        //         </div>
        //     </div>
        // </div>
    )
}

export default ForgetPassword;