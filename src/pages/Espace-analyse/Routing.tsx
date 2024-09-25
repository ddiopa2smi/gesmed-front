import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";

export const analyseRouter : RouteObject = {
    path : "espace-analyse",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-analyse/home" />,
        },
        {
            path : "home",
            element : <Home />
        }
    ]
}