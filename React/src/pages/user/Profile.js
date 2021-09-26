import React, { useState, useEffect, Fragment } from "react";
import UserSideBar from "../../components/nav/UserSideBar";
import { useSelector, useDispatch } from "react-redux";
import { getUserProfileFn } from "../../functions/user";
import getRefreshToken from "../../helper/getRefreshToken";
import { refreshTokenFn } from "../../functions/auth";
const Profile = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => {
    return state.user;
  });
  const [userProfile, setUserProfile] = useState({
    email: "",
    name: "",
    addresses: [{}],
    cardsLast4: [],
  });

  const getUserProfile = async () => {
    try {
      const res = await getUserProfileFn(token);
      setUserProfile(res.data);
    } catch (err) {
      console.log(err);
      if (err.response.data.error === "J01") {
        const rfAuthToken = getRefreshToken();
        if (rfAuthToken) {
          try {
            const res2 = await refreshTokenFn(rfAuthToken);
            //update redux state
            dispatch({
              type: "REFRESH_TOKEN",
              payload: res2.data,
            });
            const res3 = await getUserProfileFn(res2.data.token);
            setUserProfile(res3.data);
          } catch (err) {
            // todo set error
          }
        }
      }
    }
  };

  useEffect(() => {
    getUserProfile();
  }, [token]);

  const UserProfileForm = () => {
    return (
      <>
        <div className="mt-5 row">
          <p className="col-sm-2 col-form-label">Email</p>
          <p className="col-sm-10">{userProfile.email}</p>
        </div>
        <div className="mt-5 row">
          <p className="col-sm-2 col-form-label">Name</p>
          <p className="col-sm-10">{userProfile.name}</p>
        </div>
        {userProfile.addresses && userProfile.addresses.length > 0 && (
          <div className="mt-5 row">
            {userProfile.addresses.map((a, i) => {
              return (
                <Fragment key={a._id}>
                  <p className="col-sm-2 col-form-label">Addresses{i + 1}</p>
                  <p className="col-sm-10 mt-1">
                    {a.buildingOrStreet}|{a.unitNo}
                    <br />
                    {a.country}|{a.postalCode}
                    <br />
                    {a.city}|{a.contactNumber}
                  </p>
                </Fragment>
              );
            })}
          </div>
        )}
        {userProfile.cardsLast4 && userProfile.cardsLast4.length > 0 && (
          <div className="mt-5 row">
            {userProfile.cardsLast4.map((c, i) => {
              return (
                <Fragment key={c}>
                  <p className="col-sm-2 col-form-label">Payment{i + 1}</p>
                  <p className="col-sm-10 mt-1">Last for Digit : {c}</p>
                </Fragment>
              );
            })}
          </div>
        )}
      </>
    );
  };
  return (
    <div className="row">
      <div className="col-md-2">
        <UserSideBar />
      </div>
      <div className="col-md-10">
        <form>{UserProfileForm()}</form>
        {/* {JSON.stringify(userProfile.cardsLast4)}
        {JSON.stringify(userProfile.cardsLast4.length)} */}
      </div>
    </div>
  );
};

export default Profile;
