import axios from "axios";

export const registerFn = async (email) => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/register`,{email});
}

export const activateAccountFn = async (token) => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/activateAccount`,{token});
}

export const activateAccountWithPasswordFn = async (token,name,password) => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/activateAccountWithPassword`,{token,name,password}); 
}

export const loginFn = async (email,password)=> {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/login`,{email,password})
}

export const logoutFn = async(rToken) => {
    
    return await axios.delete(`${process.env.REACT_APP_SERVER_API}/logout`,{data:{rToken}})
}

export const forgetPasswordFn = async email => {
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/password/forget`,{email});
}

export const resetPasswordFn = async token => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/password/reset`,{token});
}

export const resetPasswordWithPasswordFn = async (token,newPassword) => {
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/password/resetWithPassword`,{token,newPassword});
}

export const googleLoginFn = async idToken => {
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/googleLogin`,{idToken});
};

export const facebookLoginFn = async (userID,accessToken) =>{
    return await axios.post(`${process.env.REACT_APP_SERVER_API}/facebookLogin`,{userID,accessToken});
}

export const refreshTokenFn = async (refreshToken) => {
    return  await axios.post(`${process.env.REACT_APP_SERVER_API}/refreshToken`, { refreshToken })
};