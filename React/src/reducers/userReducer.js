const initialState = {
    email: null,
    token: null,
    rfToken: null,
    name: null,
    role: null,
    address: [],
    wishlist: []
    // isAuthenticated:null,
}

export const userReducer = (state = initialState, action) => {
    const { payload, type } = action;
    switch (type) {
        case "REFRESH_TOKEN":
        case "LOGGED_IN_USER":
            if (payload) {
                //save in local storage,

                // console.log("initial State : ", {...state});
                // console.log("changing State : ", JSON.stringify(payload));
                // console.log("changing token : ", JSON.stringify(payload.token));
                // console.log("changing rfToken : ", JSON.stringify(payload.rfToken));
                localStorage.setItem("token", payload.token);
                payload.rfToken && localStorage.setItem("rfToken", payload.rfToken);
                payload.rfToken = undefined;
                return {
                    ...state,
                    ...payload
                }
            } else {
                console.log("User Reducer in NULL Payload");
                //Remove in local storage
                localStorage.removeItem("token");
                localStorage.removeItem("rfToken");
                //localStorage.removeItem("cart");;
                return initialState;
            }

        case "LOGGED_OUT_USER":
            //Remove in local storage,
            localStorage.removeItem("token");
            localStorage.removeItem("rfToken");
            //localStorage.removeItem("cart");
            //clear redux
            // return {
            //     ...state,
            //     email:null,
            //     token:null,
            //     rfToken:null,
            //     name:null,
            //     role:null,
            //     address:[],
            //     wishlist:[]
            // }
            return initialState;

        default:
            return state;
    }
}

