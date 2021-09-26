import React from "react";
import {  MDBInput } from 'mdbreact';

const FilterQuery = ({searchQuery,setSearchQuery}) => {

    const handleSearchChange = e => {
        setSearchQuery(e.target.value);
    }
        return <MDBInput
        label="Filter"
        className="w-50"
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        autoFocus
    />
    
}

export default FilterQuery