import React from 'react'
import ListPatients from '../../../components/specific/ListPatients/ListPatients'
import { ServiceType } from '../../../utils/types/types.ts'

function Patients() {
  return (
    <div>
      <ListPatients serviceType={ServiceType.ANALYSE} />
    </div>
  )
}

export default Patients