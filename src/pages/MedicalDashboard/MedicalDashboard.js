import React from "react";
import DashboardComponent from "../../components/specific/DashboardComponent/DashboardComponent.js";
import { ServiceType } from "../../utils/types/types.ts";

// Tableau de bord de l'espace médical : utilise le composant partagé par tous les espaces
function MedicalDashboard() {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected")) || null;

  return (
    <DashboardComponent
      serviceType={ServiceType.MEDICAL}
      title={`Bienvenue ${userConnected?.username || ""} !`}
    />
  );
}

export default MedicalDashboard;
