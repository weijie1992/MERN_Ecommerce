import React,{useEffect,useState} from "react";
import { useHistory } from "react-router-dom";

const RedirectIfNotSignIn = () => {
    const [count, setCount] = useState(5);
    let history = useHistory();
    useEffect(()=>{
        let interval = setInterval(()=>{
            setCount((currentCount)=>--currentCount);
        },1000);
        console.log(interval);
        if(count === 0) {
            history.push("/login");
        }
        return () => {
            console.log("inside clear Interval");
            clearInterval(interval)
        };
        // interval();
    },[count]);

    //Return Layout
    return (
        <div className="container p-5 text-center">
            <p>Redirecting you to login in {count}</p>
        </div>
    )
}

export default RedirectIfNotSignIn;