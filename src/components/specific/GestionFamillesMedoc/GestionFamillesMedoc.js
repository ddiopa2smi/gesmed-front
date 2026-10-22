import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddFamilleMedoc from "../AddFamilleMedoc/AddFamillleMedoc";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des familles de médicaments avec les actions d'ajout, de modification et de suppression.
 */
function GestionFamillesMedoc({ familleMedocsList, isLoading, onRefresh }) {
    return (
        <GestionParametres
            data={familleMedocsList}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.code_famille}
            getDeleteUrl={(record) => `${endpoints.familleMedoc.DELETE}/${record?.code_famille}`}
            addTitle="Nouvelle famille"
            updateTitle="Modifier la famille"
            renderForm={(props) => <AddFamilleMedoc {...props} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "code_famille",
                    key: "code_famille",
                },
                {
                    title: "Libellé",
                    dataIndex: "libelle_famille",
                    key: "libelle_famille",
                    sorter: (a, b) => (a.libelle_famille || "").localeCompare(b.libelle_famille || ""),
                },
            ]}
        />
    );
}

export default GestionFamillesMedoc;
