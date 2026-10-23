import Prescription from "../../components/specific/Prescription/Prescription";
import { TypePrescription } from "../../utils/types/types.ts";

// Prescription de soins infirmiers : même écran que les prescriptions d'analyses et d'imagerie
function Infirmerie() {
  return <Prescription typePrescription={TypePrescription.INFIRMERIE} />;
}

export default Infirmerie;
