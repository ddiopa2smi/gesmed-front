import React from 'react'
import ListConsultations from '../../../components/specific/ListConsultations/ListConsultations'
import { ServiceType } from '../../../utils/types/types.ts'

function Consultations() {
  return (
    <ListConsultations serviceType={ServiceType.GYNECOLOGIE} />
  )
}

export default Consultations