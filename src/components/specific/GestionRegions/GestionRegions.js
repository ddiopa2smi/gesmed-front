import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddRegion from "../AddRegion/AddRegion";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des régions concernées avec les actions d'ajout, de modification et de suppression.
 */
function GestionRegions({ data, isLoading, onRefresh, onSelect }) {
    return (
        <GestionParametres
            onSelect={onSelect}
            data={data}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.code_region}
            getDeleteUrl={(record) => `${endpoints.regions.DELETE}/${record?.code_region}`}
            addTitle="Nouvelle région"
            updateTitle="Modifier la région"
            renderForm={(props) => <AddRegion {...props} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "code_region",
                    key: "code_region",
                },
                {
                    title: "Libellé",
                    dataIndex: "libelle_region",
                    key: "libelle_region",
                    sorter: (a, b) => (a.libelle_region || "").localeCompare(b.libelle_region || ""),
                },
            ]}
        />
    );
}

export default GestionRegions;
