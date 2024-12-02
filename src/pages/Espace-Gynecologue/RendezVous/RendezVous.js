import React from 'react'
import RvList from '../../../components/specific/RvList/RvList'
import { ServiceType } from '../../../utils/types/types.ts'
import { Card } from 'antd'

function RendezVous() {
  return (
    <Card>
      <RvList serviceType={ServiceType.GYNECOLOGIE}  />
    </Card>
  )
}

export default RendezVous