import React from 'react'
import AgendaComponent from '../../../components/specific/AgendaComponent/AgendaComponent';
import { ServiceType } from '../../../utils/types/types.ts';

function Agenda() {
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));

  return (
    <div>
      <AgendaComponent 
        author={userConnected.login}
        serviceType={ ServiceType.GYNECOLOGIE}
      />
    </div>
  )
}

export default Agenda