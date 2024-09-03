import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Home from "./Home/Home";
import Appointments from "./Appointments/Appointments";
import Patients from "./Patients/Patients";
import Treatments from "./Treatments/Treatments";
import Staff from "./Staff/Staff";
import PatientDetails from "./PatientDetails/PatientDetails";
import Diagnostic from "./Diagnostic/Diagnostic";

export const dentistRouter : RouteObject = {
    path : "espace-dentist",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-dentist/home" />,
        },
        {
            path : "home",
            element : <Home />
        },
        {
            path : "appointments",
            element : <Appointments />
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
                            path : "diagnostic",
                            element : <Diagnostic /> 
                        },
                    ]
                },
            ]
        },
        {
            path : "treatments",
            element : <Treatments />
        },
        {
            path : "staff",
            element : <Staff />
        },
    ]
}