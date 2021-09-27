import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginFn, googleLoginFn, facebookLoginFn } from "../functions/auth";
import { Link } from "react-router-dom";
import { GoogleLogin } from "react-google-login";
import { addCartBeforeLoginFn, getUserCartOnLoginFn } from "../functions/cart";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBInput,
  MDBBtn,
  MDBCard,
  MDBCardBody,
  MDBAlert,
  MDBIcon,
} from "mdbreact";
const regexForEmail = /^[a-zA-Z0-9_]+@(?:[a-zA-Z0-9]+\.)+[A-Za-z]+$/;
const passwordRegex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,64})"
);

const Login = ({ history }) => {
  const { user, cart } = useSelector((state) => {
    return { ...state };
  });
  console.log("asd1");
  console.log(history.location.state);
  //redirect base on role
  const roleBasedRedirect = (user) => {
    if (history.location.state && history.location.state.redirectedFrom) {
      history.push(history.location.state.redirectedFrom);
    } else {
      console.log("here2");
      if (user.role === "admin") {
        history.push("/admin/dashboard");
      } else if (user.role === "normal") {
        history.push("/");
      }
    }
  };
  const addCartBeforeLogin = async (token) => {
    if (cart && cart.length > 0) {
      //cart is not empty
      try {
        const res = await addCartBeforeLoginFn(cart, token);
        dispatch({
          type: "UPDATE_CART_ONLOGIN",
          payload: res.data,
        });
        //empty local storage cart
        if (typeof window !== "undefined") {
          console.log("here");
          localStorage.removeItem("cart");
        }
      } catch (err) {
        //this function run async No need catch, token is pass on login will unlikely it will have expire condition
      }
    } else {
      //cart is empty no need execute
      return getUserCartOnLogin(token);
    }
  };

  const getUserCartOnLogin = async (token) => {
    try {
      const res = await getUserCartOnLoginFn(token);
      dispatch({
        type: "GET_CART_ONLOGIN",
        payload: res.data,
      });
    } catch (err) {
      //this function run async No need catch, token is pass on login will unlikely it will have expire condition
    }
  };

  //Redirect if user logged in
  useEffect(() => {
    //this will stop useEffect for running twice.
    if (history.location.state) {
      return;
    } else {
      if (user && user.email && user.token) {
        //redirect
        roleBasedRedirect(user);
      }
    }
    // return () => {

    // }
  }, [user]);

  const dispatch = useDispatch();

  const [validEmail, setValidEmail] = useState(false);
  const [validPassword, setValidPassword] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const { email, password } = formData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginFn(email, password);
      //clear form data
      setFormData({
        email: "",
        password: "",
      });
      //dispatch
      dispatch({
        type: "LOGGED_IN_USER",
        payload: res.data,
      });
      addCartBeforeLogin(res.data.token);
      //redirect
      roleBasedRedirect(res.data);
    } catch (err) {
      //clear password
      setFormData({
        ...formData,
        password: "",
      });

      setLoginError(err.response.data.error);
    }
  };

  const handleChange = (text) => (e) => {
    setFormData({ ...formData, [text]: e.target.value });

    if (text === "email") {
      setValidEmail(regexForEmail.test(e.target.value));
    } else if (text === "password") {
      setValidPassword(passwordRegex.test(e.target.value));
    }
  };

  const responseGoogle = async (response) => {
    try {
      const res = await googleLoginFn(response.tokenId);

      //dispatch
      dispatch({
        type: "LOGGED_IN_USER",
        payload: res.data,
      });
      console.log(res.data);
      addCartBeforeLogin(res.data.token);
      //redirect
      roleBasedRedirect(res.data);
    } catch (err) {
      setLoginError(err.response.data.error);
    }
  };

  const responseFacebook = async (response) => {
    try {
      const res = await facebookLoginFn(response.userID, response.accessToken);
      //dispatch
      dispatch({
        type: "LOGGED_IN_USER",
        payload: res.data,
      });
      addCartBeforeLogin(res.data.token);
      //redirect
      roleBasedRedirect(res.data);
    } catch (err) {
      setLoginError(err.response.data.error);
    }
  };

  const mdBootStrapLogin = () => {
    return (
      <MDBContainer className="p-5">
        <MDBRow>
          <MDBCol md="6" className="offset-md-3">
            <MDBCard>
              <MDBCardBody>
                <form onSubmit={handleSubmit}>
                  <p className="h4 text-center py-4">Sign In</p>
                  <div className="grey-text">
                    <MDBInput
                      label="Your Email"
                      icon="envelope"
                      group
                      type="email"
                      value={email}
                      onChange={handleChange("email")}
                      autoFocus
                    />
                    <MDBInput
                      label="Your Password"
                      icon="lock"
                      group
                      type="password"
                      value={password}
                      onChange={handleChange("password")}
                    />
                  </div>
                  {email && !validEmail && (
                    <MDBAlert color="danger">Invalid Email Address</MDBAlert>
                  )}
                  {password && !validPassword && (
                    <MDBAlert color="danger">
                      Password must be 8 to 64 characters, contain 1 upper, 1
                      lower, 1 numberic and a special character
                    </MDBAlert>
                  )}
                  {loginError !== "" && password === "" && (
                    <MDBAlert color="danger">{loginError}</MDBAlert>
                  )}
                  <div className="text-center py-2">
                    <MDBBtn
                      disabled={!(validEmail && validPassword)}
                      gradient="tempting-azure"
                      rounded
                      block
                      type="submit"
                    >
                      Sign In
                    </MDBBtn>
                  </div>
                </form>
                <div className="row">
                  <div className="col">
                    <Link to="/user/forgetPassword" className="float-right m-3">
                      Forget Password?
                    </Link>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col">
                    {/* <GoogleLogin
                      clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                      buttonText="Login With Google"
                      onSuccess={responseGoogle}
                      onFailure={responseGoogle}
                      cookiePolicy={"single_host_origin"}
                      render={(renderProps) => (
                        <MDBBtn
                          rounded
                          outline
                          color="success"
                          onClick={renderProps.onClick}
                          disabled={renderProps.disabled}
                        >
                          <MDBIcon fab icon="google" />
                          Login With Google
                        </MDBBtn>
                      )}
                    /> */}
                  </div>

                  <div className="col">
                    <FacebookLogin
                      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                      autoLoad={false}
                      callback={responseFacebook}
                      icon={<MDBIcon fab icon="facebook-f" />}
                      render={(renderProps) => (
                        <MDBBtn
                          rounded
                          outline
                          color="info"
                          onClick={renderProps.onClick}
                        >
                          <MDBIcon fab icon="facebook-f" />
                          Login With Facebook
                        </MDBBtn>
                      )}
                    />
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    );
  };
  return <>{mdBootStrapLogin()}</>;
};

export default Login;
