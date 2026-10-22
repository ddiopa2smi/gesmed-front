import { Tag } from "antd";
import GestionParametres from "../../common/GestionParametres/GestionParametres";
import AddFormeGalenique from "../AddFormeGalenique/AddFormeGalenique";
import { endpoints } from "../../../constants/endpoints.constants";

/**
 * Liste des formes galéniques d'un type donné (UNITE_PRISE par défaut)
 * avec les actions d'ajout, de modification et de suppression.
 */
function GestionFormesGaleniques({ formesGaleniqueList, isLoading, onRefresh, type = "UNITE_PRISE" }) {
    const data = (formesGaleniqueList || []).filter((item) => item?.type === type);

    return (
        <GestionParametres
            data={data}
            isLoading={isLoading}
            onRefresh={onRefresh}
            rowKey={(record) => record.code_forme}
            getDeleteUrl={(record) => `${endpoints.forme_galenique.DELETE}/${record?.code_forme}`}
            addTitle="Nouvelle forme galénique"
            updateTitle="Modifier la forme galénique"
            renderForm={(props) => <AddFormeGalenique {...props} />}
            columns={[
                {
                    title: "Code",
                    dataIndex: "code_forme",
                    key: "code_forme",
                },
                {
                    title: "Libellé",
                    dataIndex: "libelle_forme",
                    key: "libelle_forme",
                    sorter: (a, b) => (a.libelle_forme || "").localeCompare(b.libelle_forme || ""),
                },
                {
                    title: "Symbole",
                    dataIndex: "symbole",
                    key: "symbole",
                },
                {
                    title: "Type",
                    dataIndex: "type",
                    key: "type",
                },
                {
                    title: "Etat",
                    dataIndex: "actif",
                    key: "actif",
                    render: (value) => (
                        <Tag color={value ? "success" : "error"}>{value ? "Actif" : "Inactif"}</Tag>
                    ),
                },
            ]}
        />
    );
}

export default GestionFormesGaleniques;
