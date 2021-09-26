import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const updatePasswordFn = async (
  currentPassword,
  updatedPassword,
  token
) => {
  setBearerToken(token);
  return await axios.put(
    `${process.env.REACT_APP_SERVER_API}/user/updatePassword`,
    { currentPassword, updatedPassword }
  );
};

export const getUserInfoFn = async (token) => {
  setBearerToken(token);
  return await axios.get(`${process.env.REACT_APP_SERVER_API}/user/info`);
};

export const updateUserInfoFn = async (updatedUserInfo, token) => {
  setBearerToken(token);
  return await axios.put(`${process.env.REACT_APP_SERVER_API}/user/info`, {
    updatedUserInfo,
  });
};

export const getUserProfileFn = async (token) => {
  setBearerToken(token);
  return await axios.get(
    `${process.env.REACT_APP_SERVER_API}/user/userProfile`
  );
};
