

export const showModalProductReducer = (state={}, action) => {
    switch(action.type) {
        case "ADD_PRODUCT_TO_MODAL" :
            return action.payload;
        case "LOGGED_OUT_USER":
            return {};
        default :
            return state;
    }
}