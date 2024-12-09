import React from "react";
import { useLocation, useParams } from "react-router";
import { ServiceType } from "../../utils/types/types.ts";
import ConsultationDentaire from "../../components/specific/ConsultationDentaire/ConsultationDentaire.js";
import ConsultationMedical from "../../components/specific/ConsultationMedical/ConsultationMedical.js";
import ConsultationGynecologie from "../../components/specific/ConsultationGynecologie/ConsultationGynecologie.js";
import ConsultationInfirmerie from "../../components/specific/ConsultationInfirmerie/ConsultationInfirmerie.js";
import ConsultationHospitalisation from "../../components/specific/ConsultationHospitalisation/ConsultationHospitalisation.js";
import ConsultationRadiologie from "../../components/specific/ConsultationRadiologie/ConsultationRadiologie.js";

function ConsultationPage() {
  const { numPatient, numRv } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const serviceType = queryParams.get("serviceType");
  let renderConsultation = null;

  switch (serviceType) {
    case ServiceType.MEDICAL:
      renderConsultation = <ConsultationMedical />;
      break;
    case ServiceType.DENTAIRE:
      renderConsultation = <ConsultationDentaire />;
      break;
    case ServiceType.GYNECOLOGIE:
      renderConsultation = <ConsultationGynecologie />;
      break;
    case ServiceType.INFIRMERIE:
      renderConsultation = <ConsultationInfirmerie />;
      break;
    case ServiceType.HOSPITALISATION:
      renderConsultation = <ConsultationHospitalisation />;
      break;
    case ServiceType.RADIOLOGIE:
      renderConsultation = <ConsultationRadiologie />;
      break;
    default:
      break;
  }
  return renderConsultation;
}

export default ConsultationPage;
