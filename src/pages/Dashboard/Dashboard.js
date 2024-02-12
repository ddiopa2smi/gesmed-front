import React from 'react'
import MedicalDashboard from '../../components/specific/MedicalDashboard/MedicalDashboard';
import PharmacyDashboard from '../../components/specific/PharmacyDashboard/PharmacyDashboard';

function Dashboard() {
  const space = sessionStorage.getItem("space");
  
  return (
    space === "smed" ? <MedicalDashboard /> : <PharmacyDashboard/>
  )
}

export default Dashboard