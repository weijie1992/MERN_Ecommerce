import React from "react";
import {Route} from "react-router-dom";
import {useSelector} from "react-redux";
import RedirectIfNotSignIn from "./RedirectIfNotSignIn"
const UserRoute = ({...rest}) => {
    const user = useSelector((state)=> {
        return state.user;
    });
    
    return user&&user.token ? (<Route {...rest} />) : (<RedirectIfNotSignIn/>)
}


export default UserRoute;
