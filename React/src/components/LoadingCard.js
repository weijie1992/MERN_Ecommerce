import React from "react";
import { MDBIcon, MDBCard } from 'mdbreact';
import { Link } from "react-router-dom";
import { Skeleton, Card } from 'antd';

const LoadingCard = ({ numOfLoadingItems }) => {
    const cards = () => {
        let totalCards = [];
        for (let i = 0; i < numOfLoadingItems; i++) {
            totalCards.push(
                <Card key={i} className="col-md-3">
                    <Skeleton active></Skeleton>
                </Card>
            )
        }
        return totalCards;
    }
    return <div className="row pb-5">{cards()}</div>
}

export default LoadingCard;