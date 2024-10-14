import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Dashboard from "./pages/Dashboard/Dashboard";
import Hospitalisations from "./pages/Hospitalisations/Hospitalisations";
import NewHospitalisation from "./pages/New Hospilation/NewHospitalisation";
import HistoriqueSoins from "./pages/HistoriqueSoins/HistoriqueSoins";

export const hospitalisationRouter : RouteObject = {
    path : "espace-hospitalisation",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-hospitalisation/dashboard" />,
        },
        {
            path : "dashboard",
            element : <Dashboard />
        },
        {
            path : "hospitalisations",
            children : [
                {
                    index : true,
                    element : <Hospitalisations />
                },
                {
                    path : "new-hospitalisation",
                    element : <NewHospitalisation />
                }
            ]
        },
        {
            path : "historique-soins",
            element : <HistoriqueSoins />
        },
    ]
}