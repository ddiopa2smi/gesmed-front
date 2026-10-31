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
import InfosCliniques from "./InfosCliniques/InfosCliniques";
import StatistiquesExamens from "../../components/specific/StatistiquesExamens/StatistiquesExamens";
import AccesReserve from "../../components/common/AccesReserve/AccesReserve";

export const radiologieRouter: RouteObject = {
    path: "espace-radiologie",
    element: <MySpace />,
    children: [
        {
            path: "",
            element: <Navigate to="/espace-radiologie/dashboard" />,
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
            path: "agenda",
            element: <Agenda />
        },
        {
            path: "patients",
            children: [
                {
                    path: "",
                    element: <Patients />
                },
                {
                    path: "",
                    children: [
                        {
                            path: ":id",
                            children: [
                                {
                                    index: true,
                                    element: <DossierMedical />
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
            path: "consultations",
            element: <Consultations />
        },
        {
            path: "consultation/:numPatient/:numRv",
            element: <ConsultationPage />
        },
        {
            path: "statistiques",
            element: (
                <AccesReserve espace="imagerie" message="Les statistiques de radiologie sont accessibles uniquement aux médecins et aux administrateurs.">
                    <StatistiquesExamens type="imagerie" />
                </AccesReserve>
            )
        },
    ]
}