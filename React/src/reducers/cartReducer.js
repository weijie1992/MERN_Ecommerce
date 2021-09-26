let initialState = [];
console.log("cartReducer");
//load cart item from local storage
if (localStorage.getItem("cart")) {
    console.log("cartReducer1");
    initialState = JSON.parse(localStorage.getItem("cart"));
    console.log(initialState);
} else {
    console.log("cartReducer2");
    initialState = [];
}

export const cartReducer = (state = initialState, action) => {
    switch (action.type) {
        case "GET_CART_ONMOUNT":
        case "GET_CART_ONLOGIN":
        case "UPDATE_CART_ONLOGIN":
        case "UPDATE_CART":
        case "DELETE_SINGLE_CART_ITEM":
        case "ADD_TO_CART":
            return action.payload;
        case "LOGGED_OUT_USER":
        case "EMPTY_CART_AFTER_SUCCESSFUL_PURCHASE" :
            console.log("CartReducer_LOGGEDOUTUSER");
            if(localStorage.getItem("cart")) {
                localStorage.removeItem("cart");
            }
            return initialState;
        default:
            return state
    }
}