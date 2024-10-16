import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";
import Analyses from "./Analyses/Analyses";
import Historique from "./Historique/Historique";
import DetailsAnalyse from "./DetailsAnalyse/DetailsAnalyse";
import TraitementAnalyse from "./TraitementAnalyse/TraitementAnalyse";

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
        },
        {
            path : "analyses",
            children: [
                {
                    index : true,
                    element : <Analyses />
                },
                {
                    path : "details/:id",
                    element : <TraitementAnalyse />
                },
            ]
        },
        {
            path : "historique",
            children: [
                {
                    index : true,
                    path : "",
                    element : <Historique />
                },
                {
                    path : "details/:id",
                    element : <DetailsAnalyse />
                },
            ]
        },
    ]
}