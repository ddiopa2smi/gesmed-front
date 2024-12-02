import { Card, Typography } from 'antd'
import React from 'react'
import { ServiceType } from '../../../utils/types/types.ts'
import DashboardComponent from '../../../components/specific/DashboardComponent/DashboardComponent.js'
const {Text} = Typography
function Dashboard() {
  return (
    <DashboardComponent serviceType={ServiceType.GYNECOLOGIE} />
  )
}

export default Dashboard