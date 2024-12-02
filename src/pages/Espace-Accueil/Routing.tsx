import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Patients from "./Patients/Patients";
import Dashboard from "./Dashboard/Dashboard";
import RendezVous from "./RendezVous/RendezVous";
import Facturation from "./Facturation/Facturation";


export const accueilRouter : RouteObject = {
    path : "espace-accueil",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-accueil/dashboard" />,
        },
        {
            path : "dashboard",
            element : <Dashboard />
        },
        {
            path : "rendez-vous",
            element : <RendezVous />
        },
        {
            path : "patients",
            children : [
                {
                    path : "",
                    element : <Patients />
                },
                // {
                //     path : "details",
                //     children : [
                //         {
                //             path : "",
                //             element : <PatientDetails /> 
                //         },
                //         {
                //             path : "diagnostic",
                //             element : <Diagnostic /> 
                //         },
                //     ]
                // },
            ]
        },
        {
            path : "facturation",
            element : <Facturation />
        },
        // {
        //     path : "treatments",
        //     element : <Treatments />
        // },
        // {
        //     path : "peripherals",
        //     children : [
        //         {
        //             path : "",
        //             element : <Peripherals /> 
        //         },
        //         {
        //             path : "new-peripheral",
        //             element : <NewPeripheral /> 
        //         },
        //     ]
        // },
        // {
        //     path : "staff",
        //     element : <Staff />
        // },
    ]
}