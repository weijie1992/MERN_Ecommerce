const initialState = {
    keyword: ""
};
export const searchReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SEARCH_QUERY":
            return {
                ...state,
                ...action.payload
            }
        case "LOGGED_OUT_USER":
            return initialState;
        default:
            return state
    }
}