import Prescription from "../../components/specific/Prescription/Prescription";
import { TypePrescription } from "../../utils/types/types.ts";

function Imagerie() {
  return (
    <Prescription typePrescription={TypePrescription.IMAGERIE} />
  )
}

export default Imagerie
