import {combineReducers} from "redux";
import {userReducer} from "./userReducer";
import {searchReducer} from "./searchReducer";
import { cartReducer } from "./cartReducer";
import { cartModalReducer } from "./cartModalReducer";
import { showModalProductReducer } from "./showModalProductReducer";

const rootReducer = combineReducers({
    user:userReducer,
    search:searchReducer,
    cart:cartReducer,
    cartModal:cartModalReducer,
    showModalProduct:showModalProductReducer
});

export default rootReducer;
