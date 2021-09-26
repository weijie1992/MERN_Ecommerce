import React, { useEffect, useState } from "react";
import {useDispatch} from  "react-redux";
import { Route } from "react-router-dom";
import { useSelector } from "react-redux";
import RedirectIfNotSignIn from "./RedirectIfNotSignIn"
import { adminCheckFn } from "../../functions/admin";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
const AdminRoute = ({ ...rest }) => {
    console.log("AdminRoute.js");
    const user = useSelector((state) => {
        console.log("Inslude use Selector");
        return state.user;
    });

    const dispatch = useDispatch();

    const [ok, setOk] = useState(false);

    const adminCheck = async () => {
        try {
            await adminCheckFn(user.token);
            setOk(true);
        }
        catch (err) {
            if (err.response.data.error === "J01") {
                //get Refresh Token from local storage
                const rfAuthToken = getRefreshToken();
                if (rfAuthToken === null) { //check if refresh token exist
                    setOk(false);
                }
                else {//refresh token exist, retrieve new refresh token
                    try {
                        const res2 = await refreshTokenFn(rfAuthToken);
                        //update redux state
                        dispatch({
                            type: "REFRESH_TOKEN",
                            payload: res2.data
                        });
                        //try with new JWT 2nd time
                        try {
                            await adminCheckFn(res2.data.token);
                            setOk(true);
                        }
                        catch (err) {
                            setOk(false);
                        }

                    } //error from retrieving refresh token
                    catch (err) {
                        setOk(false);
                    }
                }
            } else { //first call error but not J01
                setOk(false);
            }
        }
    }

    useEffect(() => {
        console.log("Admin Route UseEffect");
        adminCheck();
    }, [user])

    return ok ? (<Route {...rest} />) : (<RedirectIfNotSignIn />);
}

export default AdminRoute;