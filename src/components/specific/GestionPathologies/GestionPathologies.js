import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddPathologie from "../AddPathologie/AddPathologie";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des pathologies avec les actions d'ajout, de modification et de suppression.
 */
function GestionPathologies({ data, isLoading, onRefresh, codeSpe, onSelect }) {
    return (
        <GestionParametres
            onSelect={onSelect}
            data={data}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.code_patho}
            getDeleteUrl={(record) => `${endpoints.pathologie.DELETE}/${record?.code_patho}`}
            addTitle="Nouvelle pathologie"
            updateTitle="Modifier la pathologie"
            renderForm={(props) => <AddPathologie {...props} codeService={codeSpe} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "code_patho",
                    key: "code_patho",
                },
                {
                    title: "Libellé",
                    dataIndex: "libelle_patho",
                    key: "libelle_patho",
                    sorter: (a, b) => (a.libelle_patho || "").localeCompare(b.libelle_patho || ""),
                },
                {
                    title: "Spécialité",
                    dataIndex: "code_spe",
                    key: "code_spe",
                },
                {
                    title: "Description",
                    dataIndex: "description",
                    key: "description",
                    ellipsis: true,
                },
            ]}
        />
    );
}

export default GestionPathologies;
