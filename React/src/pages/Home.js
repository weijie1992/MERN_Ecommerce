import React from "react";
import Typewriter from "typewriter-effect";
import NewlyAdded from "../components/NewlyAdded";
import BestSellers from "../components/BestSellers";
const Home = () => {

    const typeWriter = () => {
        return <Typewriter
            options={{
                strings: "SG FRESH FRUITS 24/7 SAME DAY DELIVERY",
                autoStart: true,
                loop: true
            }}
        />
    }
    return (
        <>
            <div className="text-danger h1 font-weight-bold text-center pt-3">{typeWriter()}</div>
            <NewlyAdded/>
            <BestSellers/>
        </>
    )
};

export default Home;