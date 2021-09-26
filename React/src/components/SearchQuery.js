import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
    SearchOutlined
} from '@ant-design/icons';
import { useHistory } from "react-router-dom";

const SearchQuery = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const [text, setText] = useState("");
    const handleChange = e => {

        setText(e.target.value);

        dispatch({
            type: "SEARCH_QUERY",
            payload: {
                keyword: e.target.value
            }
        })
    }
    const handleSubmit = e => {
        e.preventDefault();
        history.push(`/search?keyword=${text}`)
        console.log(e);
    }
    return (
        <form className="form-inline" onSubmit={handleSubmit}>
            <input
                type="search"
                value={text}
                className="form-control mr-2"
                onChange={handleChange}
                placeholder="Search for"
            />
            <SearchOutlined  onClick={handleSubmit} style={{cursor:"pointer"}}/>
        </form>
        
    )
}

export default SearchQuery;