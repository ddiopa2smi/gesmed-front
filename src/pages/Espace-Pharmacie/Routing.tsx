import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import FicheProduit from "./FicheProduit/FicheProduit";

export const pharmacieRouter : RouteObject = {
    path : "espace-pharmacie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-pharmacie/fiche-produit" />,
        },
        {
            path : "fiche-produit",
            element : <FicheProduit />
        },
    ]
}