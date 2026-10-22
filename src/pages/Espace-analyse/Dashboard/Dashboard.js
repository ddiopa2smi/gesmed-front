import React from 'react'
import PrescriptionsDashboard from '../../../components/specific/PrescriptionsDashboard/PrescriptionsDashboard'
import AnalysesList from '../../../components/specific/AnalysesList/AnalysesList'
import { codesPrescriptions } from '../../../constants/app.constants'

// Tableau de bord du laboratoire : indicateurs calculés sur les prescriptions d'analyses
function Dashboard() {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected")) || null;
  return (
    <PrescriptionsDashboard
      codepresc={codesPrescriptions.ANA}
      title={`Bienvenue ${userConnected?.username || ""} !`}
      labels={{ singulier: "Analyse", pluriel: "Analyses", actes: "Examens", traitees: "Clôturées" }}
      withResultats
      workList={<AnalysesList />}
    />
  )
}

export default Dashboard
