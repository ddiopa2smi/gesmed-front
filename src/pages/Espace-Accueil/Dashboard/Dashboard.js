import React from "react";
import DashboardComponent from "../../../components/specific/DashboardComponent/DashboardComponent";
import { ServiceType } from "../../../utils/types/types.ts";

// Tableau de bord de l'accueil : toutes les données, sans filtre par service
function Dashboard() {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected")) || null;

  return (
    <DashboardComponent
      serviceType={ServiceType.ACCUEIL}
      title={`Bienvenue ${userConnected?.username || ""} !`}
    />
  );
}

export default Dashboard;
