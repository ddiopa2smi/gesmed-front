import React from "react";
import { Navigate, RouteObject } from "react-router";
import MySpace from "../../layouts/MySpace/MySpace";
import Patients from "./Patients/Patients";
import PatientDetails from "./DossierMedical/DossierMedical";
import Dashboard from "./Dashboard/Dashboard";
import RendezVous from "./RendezVous/RendezVous";
import Agenda from "./Agenda/Agenda";
import Consultations from "./Consultations/Consultations";
import DossierMedical from "./DossierMedical/DossierMedical";
import ConsultationPage from "../ConsultationPage/ConsultationPage";
import InfosCliniques from "./InfosCliniques/InfosCliniques";

export const dentistRouter: RouteObject = {
    path: "espace-dentist",
    element: <MySpace />,
    children: [
        {
            path: "",
            element: <Navigate to="/espace-dentist/dashboard" />,
        },
        {
            path: "dashboard",
            element: <Dashboard />
        },
        {
            path: "rendez-vous",
            element: <RendezVous />
        },
        {
            path: "patients",
            children: [
                {
                    path: "",
                    element: <Patients />
                },
                {

                    children: [
                        {
                            path: ":id",
                            children: [
                                {
                                    index: true,
                                    element: <DossierMedical />,
                                },
                                {
                                    path: "infos-cliniques",
                                    element: <InfosCliniques />
                                },
                            ]
                        },
                    ]
                },
            ]
        },
        {
            path: "agenda",
            element: <Agenda />
        },
        {
            path: "consultations",
            element: <Consultations />
        },
        {
            path: "consultation/:numPatient/:numRv",
            element: <ConsultationPage />
        },
    ]
}