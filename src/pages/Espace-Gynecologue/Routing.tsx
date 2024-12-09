import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Consultations from "./Consultations/Consultations";
import Patients from "./Patients/Patients";
import Consultation from "./Consultation/Consultation";
import DetailsConsultation from "./DetailsConsultation/DetailsConsultation";
import Dashboard from "./Dashboard/Dashboard";
import Agenda from "./Agenda/Agenda";
import RendezVous from "./RendezVous/RendezVous";
import DossierMedical from "./DossierMedical/DossierMedical";
import ConsultationPage from "../ConsultationPage/ConsultationPage";

export const gynecologieRouter : RouteObject = {
    path : "espace-gynecologie",
    element : <MySpace />,
    children : [
        {
            path : "",
            element : <Navigate to="/espace-gynecologie/dashboard" />,
        },
        {
            path : "dashboard",
            element : <Dashboard />
        },
        {
            id : "patients",
            path : "patients",
            children : [
                {
                   index : true,
                    element : <Patients />,
                },
                {
                    id : "dossier-medical",
                    path : "dossier-medical",
                    children : [
                        {
                            path : ":id",
                            children : [
                                {
                                    index : true,
                                    element : <DossierMedical /> 
                                },
                                {
                                    path : "consultation",
                                    element : <Consultation /> 
                                },
                            ]
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
            path : "agenda",
            element : <Agenda />
        },
        {
            path : "rendez-vous",
            element : <RendezVous />
        },
        {
            path : "consultations",
            children : [
                {
                    path : "",
                    element : <Consultations /> ,
                },
                {
                    path : "details-consultation",
                    element : <DetailsConsultation /> 
                },
            ]
        },
        {
            path : "consultation/:numPatient/:numRv",
            element : <ConsultationPage/>
        },
    ]
}