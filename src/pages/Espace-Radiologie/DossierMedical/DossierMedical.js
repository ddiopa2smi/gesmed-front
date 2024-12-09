import React from 'react'
import DossierPatient from '../../../components/specific/DossierPatient/DossierPatient'
import { ServiceType } from '../../../utils/types/types.ts'

function DossierMedical() {
  return (
    <div>
      <DossierPatient serviceType={ServiceType.RADIOLOGIE} />
    </div>
  )
}

export default DossierMedical