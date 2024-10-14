import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Dashboard from "./pages/Dashboard/Dashboard";
import Patients from "./pages/Patients/Patients";
import Consultations from "./pages/Consultations/Consultations";
import SuiviTraitement from "./pages/SuiviTraitement/SuiviTraitement";
import NewConsultation from "./pages/NewConsultation/NewConsultation";
import NewTreatment from "./pages/NewTreatment/NewTreatment";

export const infirmerieRouter : RouteObject = {
    path : "espace-infirmerie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-infirmerie/dashboard" />,
        },
        {
            path : "dashboard",
            element : <Dashboard />
        },
        {
            path : "patients",
            element : <Patients />
        },
        {
            path : "consultations",
            children : [
                {
                    index : true,
                    element : <Consultations />
                },
                {
                    path : "new-consultation",
                    element : <NewConsultation />
                }
            ]
        },
        {
            path : "suivi-traitement",
            children : [
                {
                    index : true,
                    element : <SuiviTraitement />
                },
                {
                    path : "new-treatment",
                    element : <NewTreatment />
                }
            ]
        },
    ]
}