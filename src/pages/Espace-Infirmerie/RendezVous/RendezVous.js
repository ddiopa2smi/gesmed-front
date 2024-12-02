import React from 'react'
import RvList from '../../../components/specific/RvList/RvList'
import { ServiceType } from '../../../utils/types/types.ts'

function RendezVous() {
  return (
    <div>
      <RvList serviceType={ServiceType.INFIRMERIE} />
    </div>
  )
}

export default RendezVous