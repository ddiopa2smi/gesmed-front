import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Dashboard from "./Dashboard/Dashboard";
import RendezVous from "./RendezVous/RendezVous";
import Agenda from "./Agenda/Agenda";
import Patients from "./Patients/Patients";
import Consultations from "./Consultations/Consultations";
import DossierMedical from "./DossierMedical/DossierMedical";
import ConsultationPage from "../ConsultationPage/ConsultationPage";

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
            path : "rendez-vous",
            element : <RendezVous />
        },
        {
            path : "agenda",
            element : <Agenda />
        },
        {
            path : "patients",
            children : [
                {
                    path : "",
                    element : <Patients />
                },
                {
                    path : "dossier-medical",
                    children : [
                        {
                            path : ":id",
                            element : <DossierMedical />
                        },
                    ]
                },
            ]
        },
        {
            path : "consultations",
            element : <Consultations />
        },
        {
            path : "consultation/:numPatient/:numRv",
            element : <ConsultationPage/>
        },
    ]
}