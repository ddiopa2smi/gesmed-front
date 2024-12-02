import React from 'react'
import ListConsultations from '../../../components/specific/ListConsultations/ListConsultations'
import { ServiceType } from '../../../utils/types/types.ts'

function Consultations() {
  return (
    <div>
      <ListConsultations serviceType={ServiceType.ANALYSE}  />
    </div>
  )
}

export default Consultations