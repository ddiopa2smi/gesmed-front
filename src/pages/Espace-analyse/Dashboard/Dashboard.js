import React from 'react'
import DashboardComponent from '../../../components/specific/DashboardComponent/DashboardComponent'
import { ServiceType } from '../../../utils/types/types.ts'

function Dashboard() {
  return (
    <DashboardComponent serviceType={ServiceType.ANALYSE} />
  )
}

export default Dashboard