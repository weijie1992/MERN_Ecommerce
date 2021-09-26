//get Refresh Token from local storage
const getRefreshToken = () => {
    const rfAuthToken = localStorage.getItem("rfToken");
    if (!rfAuthToken) {
        localStorage.removeItem("token");
        localStorage.removeItem("rfToken");
        return null;
    }
    else {
        return rfAuthToken;
    }
}
export default getRefreshToken;