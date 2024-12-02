import {
  Card
} from "antd";
import React from "react";
import RvList from "../../../components/specific/RvList/RvList";
import { ServiceType } from "../../../utils/types/types.ts";

function RendezVous() {
  
  return (
    <Card>
      <RvList serviceType={ServiceType.ACCUEIL} />
    </Card>
  );
}

export default RendezVous;
