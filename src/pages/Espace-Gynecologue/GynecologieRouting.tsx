import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";
import Consultations from "./Consultations/Consultations";
import Appointements from "./Appointments/Appointments";
import Patients from "./Patients/Patients";
import PatientDetails from "./PatientDetails/PatientDetails";
import Consultation from "./Consultation/Consultation";
import DetailsConsultation from "./DetailsConsultation/DetailsConsultation";

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
        {
            path : "patients",
            children : [
                {
                    path : "",
                    element : <Patients />
                },
                {
                    path : "details",
                    children : [
                        {
                            path : "",
                            element : <PatientDetails /> 
                        },
                        {
                            path : "consultation",
                            element : <Consultation /> 
                        },
                    ]
                },
            ]
        },
        {
            path : "appointments",
            element : <Appointements />
        },
        {
            path : "consultations",
            children : [
                {
                    path : "",
                    element : <Consultations /> 
                },
                {
                    path : "details-consultation",
                    element : <DetailsConsultation /> 
                },
            ]
        },
    ]
}