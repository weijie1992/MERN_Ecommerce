export const cartModalReducer = (state=false,action ) => {
    switch(action.type) {
        case "TOGGLE_CARTMODAL" : 
            return action.payload;
        default : 
            return state;
    }
}