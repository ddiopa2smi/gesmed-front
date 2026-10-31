import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddMotif from "../AddMotif/AddMotif";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des motifs de consultation avec les actions d'ajout, de modification et de suppression.
 */
function GestionMotifs({ data, isLoading, onRefresh, codeSpe, onSelect }) {
    return (
        <GestionParametres
            onSelect={onSelect}
            data={data}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.code_motifcons}
            getDeleteUrl={(record) => `${endpoints.motifs.DELETE}/${record?.code_motifcons}`}
            addTitle="Nouveau motif"
            updateTitle="Modifier le motif"
            renderForm={(props) => <AddMotif {...props} codeSpe={codeSpe} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "code_motifcons",
                    key: "code_motifcons",
                },
                {
                    title: "Libellé",
                    dataIndex: "libelle_motifcons",
                    key: "libelle_motifcons",
                    sorter: (a, b) => (a.libelle_motifcons || "").localeCompare(b.libelle_motifcons || ""),
                },
                {
                    title: "Spécialité",
                    dataIndex: "code_spe",
                    key: "code_spe",
                },
            ]}
        />
    );
}

export default GestionMotifs;
