import PrescriptionsDashboard from '../../components/specific/PrescriptionsDashboard/PrescriptionsDashboard';
import OrdonnancesList from '../../components/specific/OrdonnancesList/OrdonnancesList';
import { codesPrescriptions } from '../../constants/app.constants.js';

// Tableau de bord de la pharmacie : ordonnances à servir, stock et commandes
function PharmacyDashboard() {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected")) || null;
  return (
    <PrescriptionsDashboard
      codepresc={codesPrescriptions.ORD}
      title={`Bienvenue ${userConnected?.username || ""} !`}
      labels={{ singulier: "Ordonnance", pluriel: "Ordonnances", actes: "Médicaments", traitees: "Servies" }}
      withStock
      basePath="/espace-pharmacie"
      workList={<OrdonnancesList />}
    />
  )
}

export default PharmacyDashboard
