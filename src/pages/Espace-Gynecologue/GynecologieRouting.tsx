import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";

export const gynecologieRouter : RouteObject = {
    path : "espace-gynecologie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-gynecologie/home" />,
        },
        {
            path : "home",
            element : <Home />
        },
    ]
}