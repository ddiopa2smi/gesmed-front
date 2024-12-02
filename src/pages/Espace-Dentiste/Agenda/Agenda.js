import React from 'react'
import AgendaComponent from '../../../components/specific/AgendaComponent/AgendaComponent'
import { ServiceType } from '../../../utils/types/types.ts'

function Agenda() {
  return (
    <div>
      <AgendaComponent serviceType={ServiceType.DENTAIRE} />
    </div>
  )
}

export default Agenda