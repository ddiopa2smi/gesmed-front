import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddConditionnement from "../AddConditionnement/AddConditionnement";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des conditionnements avec les actions d'ajout, de modification et de suppression.
 */
function GestionConditionnements({ conditionnementsList, isLoading, onRefresh }) {
    return (
        <GestionParametres
            data={conditionnementsList}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.cond_code}
            getDeleteUrl={(record) => `${endpoints.conditionnements.DELETE}/${record?.cond_code}`}
            addTitle="Nouveau conditionnement"
            updateTitle="Modifier le conditionnement"
            renderForm={(props) => <AddConditionnement {...props} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "cond_code",
                    key: "cond_code",
                },
                {
                    title: "Libellé",
                    dataIndex: "cond_lib",
                    key: "cond_lib",
                    sorter: (a, b) => (a.cond_lib || "").localeCompare(b.cond_lib || ""),
                },
                {
                    title: "Quantité",
                    dataIndex: "cond_qte",
                    key: "cond_qte",
                },
            ]}
        />
    );
}

export default GestionConditionnements;
