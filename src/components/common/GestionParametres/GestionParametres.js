import { useState } from "react";
import { Button, Flex, Input, Modal, Space, Tooltip, Typography, message } from "antd";
import { DeleteOutlined, EditOutlined, InfoCircleOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import DataTable from "../DataTable/DataTable";
import { deleteActions } from "../../../actions/actions";
import { deletePopup } from "../../../utils/helpers";

const { Text } = Typography;

/**
 * Liste d'un paramètre (forme galénique, famille, conditionnement...) avec les actions
 * d'ajout, de modification et de suppression.
 *
 * renderForm({ operationType, currentRecord, setOpen, onRefresh }) rend le formulaire d'ajout/modification.
 * getDeleteUrl(record) renvoie l'URL de suppression de la ligne.
 * onSelect(record) (facultatif) : appelé au double-clic sur une ligne, pour choisir directement la valeur.
 */
function GestionParametres({
    data,
    isLoading,
    onRefresh,
    rowKey,
    columns,
    getDeleteUrl,
    renderForm,
    addTitle = "Ajouter",
    updateTitle = "Modifier",
    onSelect,
}) {
    const [open, setOpen] = useState(false);
    const [operationType, setOperationType] = useState("add");
    const [currentRecord, setCurrentRecord] = useState(null);
    const [search, setSearch] = useState("");

    // Recherche sur toutes les colonnes affichées
    const searchValue = search.trim().toLowerCase();
    const filteredData = (data || []).filter((record) =>
        !searchValue || columns.some((column) =>
            String(record?.[column.dataIndex] ?? "").toLowerCase().includes(searchValue)
        )
    );

    const onAdd = () => {
        setCurrentRecord(null);
        setOperationType("add");
        setOpen(true);
    };

    const onEdit = (record) => {
        setCurrentRecord({ ...record });
        setOperationType("update");
        setOpen(true);
    };

    const onDelete = (record) => {
        deletePopup().then((result) => {
            if (result.isConfirmed) {
                deleteActions(getDeleteUrl(record))
                    .then((response) => {
                        if (response?.data) {
                            message.success("Ligne retirée avec succès");
                            onRefresh();
                        }
                    });
            }
        });
    };

    return (
        <>
            <Flex justify="space-between" align="center" gap={12} style={{ marginBottom: 12 }}>
                <Input
                    style={{ maxWidth: 300 }}
                    placeholder="Rechercher"
                    prefix={<SearchOutlined />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    allowClear
                />
                <Space>
                    {onSelect && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            <InfoCircleOutlined /> Double-cliquez sur une ligne pour la sélectionner
                        </Text>
                    )}
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                        Ajouter
                    </Button>
                </Space>
            </Flex>

            <DataTable
                compact
                dataSource={data || []}
                dataSourceCopy={filteredData}
                tableLoading={isLoading}
                rowKey={rowKey}
                onRow={onSelect ? (record) => ({
                    onDoubleClick: () => onSelect(record),
                    style: { cursor: "pointer" },
                    title: "Double-cliquer pour sélectionner",
                }) : undefined}
                columns={[
                    ...columns,
                    {
                        fixed: "right",
                        render: (record) => (
                            <Space size={0}>
                                <Tooltip title="Modifier">
                                    <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(record)} />
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => onDelete(record)} />
                                </Tooltip>
                            </Space>
                        ),
                    },
                ]}
            />

            <Modal
                title={operationType === "add" ? addTitle : updateTitle}
                open={open}
                onCancel={() => setOpen(false)}
                footer={null}
                destroyOnClose
            >
                {renderForm({ operationType, currentRecord, setOpen, onRefresh })}
            </Modal>
        </>
    );
}

export default GestionParametres;
