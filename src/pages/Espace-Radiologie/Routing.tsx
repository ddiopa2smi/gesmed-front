import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";

export const radiologieRouter : RouteObject = {
    path : "espace-radiologie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-radiologie/home" />,
        },
        {
            path : "home",
            element : <Home />
        }
    ]
}