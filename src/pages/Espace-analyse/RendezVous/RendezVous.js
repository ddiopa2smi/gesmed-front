import React from 'react'
import RvList from '../../../components/specific/RvList/RvList'
import { ServiceType } from '../../../utils/types/types.ts'

function RendezVous() {
  return (
    <RvList serviceType={ServiceType.ANALYSE} />
  )
}

export default RendezVous