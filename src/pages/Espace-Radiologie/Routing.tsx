import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";
import RadioList from "./RadioList/RadioList";
import Historique from "./Historique/Historique";
import RadioDetails from "./RadioDetails/RadioDetails";

export const radiologieRouter : RouteObject = {
    path : "espace-radiologie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-radiologie/dashboard" />,
        },
        {
            path : "dashboard",
            element : <Home />
        },
        {
            path : "radiologies",
            children : [
                {
                    index : true,
                    element : <RadioList />
                },
                {
                    path : "details/:id",
                    element : <RadioDetails />
                },
            ]
        },
        {
            path : "historique",
            element : <Historique />
        }
    ]
}