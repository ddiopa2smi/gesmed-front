import { Button, Dropdown, Flex, message, Modal, Space } from "antd";
import DataTable from "../../common/DataTable/DataTable";
import { useState } from "react";
import useSearch from "../../../utils/hooks/useSearch";
import { MoreOutlined } from "@ant-design/icons";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
import { codesPrescriptions } from "../../../constants/app.constants";
import AddActe from "../AddActe/AddActe";
import { deletePopup } from "../../../utils/helpers";
import { deleteActions } from "../../../actions/actions";
import SearchBar from "../../common/SearchBar/SearchBar";
import { TypePrescription } from "../../../utils/types/types.ts";

function GestionActes({
    typePrescription = TypePrescription.ANALYSE
}) {
    const [isAddActesModalVisible, setIsAddActesModalVisible] = useState(false);
    const [currentActe, setCurrentActe] = useState(null);

    const { data: listActes, dataCopy: listActesCopy, setDataCopy: setListActesCopy, isLoading, onRefresh } = useFetch(
        `${endpoints.actes.LIST}?codeacte=${typePrescription === TypePrescription.ANALYSE ? codesPrescriptions.ANA : codesPrescriptions.IMG}`
    );

    const { getColumnSearchProps } = useSearch();

    const onEdit = (acte) => {
        setCurrentActe(acte);
        setIsAddActesModalVisible(true);
    };
    const onDelete = (acte) => {
        deletePopup().then((result) => {
            if (result.isConfirmed) {
                deleteActions(endpoints.actes.DELETE(acte?.codeacte)).then((response) => {
                    if (response?.data) {
                        message.success("Ligne retirée avec succès");
                        onRefresh();
                    }
                });
            }
        });
    };


    return <div>
        <Flex justify="space-between" style={{ marginBottom: 6 }}>
            <SearchBar
                data={listActes}
                setDataCopy={setListActesCopy}
                listKeys={["codeacte", "libacte", "categorie"]}
            />
            <Space>
                <Button
                    type="primary"
                    ghost
                    onClick={onRefresh}
                >
                    Actualiser
                </Button>
                <Button
                    type="primary"
                    onClick={() => {
                        setCurrentActe(null);
                        setIsAddActesModalVisible(true);
                    }}
                >
                    Ajouter un acte
                </Button>
            </Space>
        </Flex>
        <DataTable
            compact
            tableLoading={isLoading}
            dataSource={listActes}
            dataSourceCopy={listActesCopy}
            setDataSourceCopy={setListActesCopy}
            rowKey={(record) => record.codeacte}

            columns={[
                {
                    title: "Code",
                    dataIndex: "codeacte",
                    key: "codeacte",
                    ...getColumnSearchProps("codeacte"),
                },
                {
                    title: "Libellé",
                    dataIndex: "libacte",
                    key: "libacte",
                    sorter: (a, b) =>
                        a.libacte.charCodeAt(0) - b.libacte.charCodeAt(0),
                    ...getColumnSearchProps("libacte"),
                },

                {
                    title: "Catégorie",
                    dataIndex: "categorie",
                    key: "categorie",
                    sorter: (a, b) =>
                        a.categorie.charCodeAt(0) - b.categorie.charCodeAt(0),
                    filters: [...new Set(listActesCopy?.map((item) => item?.categorie))].map((item) => {
                        return {
                            text: item,
                            value: item,
                        };
                    }),
                    filterMultiple: false,
                    onFilter: (value, record) =>
                        record.categorie.indexOf(value) === 0,
                },
                {
                    title: "Tarif",
                    dataIndex: "tarif",
                    key: "tarif",
                    sorter: (a, b) =>
                        a.tarif.charCodeAt(0) - b.tarif.charCodeAt(0),
                    ...getColumnSearchProps("tarif"),
                    render: (value) => value || "-",
                },
                {
                    fixed: "right",
                    render: (record) => (
                        <Flex align="center">
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            label: "Modifier",
                                            key: "0",
                                            onClick: () => {
                                                onEdit(record);
                                            },
                                        },
                                        {
                                            label: "Supprimer",
                                            key: "1",
                                            onClick: () => {
                                                onDelete(record);
                                            },
                                            danger: true
                                        },
                                    ],
                                }}
                                trigger={["click"]}
                            >
                                <Button size="small" type="text" icon={<MoreOutlined />} />
                            </Dropdown>
                        </Flex>
                    ),
                },
            ]}
        />

        <Modal
            title={
                currentActe ? "Modification acte" : "Ajout acte"
            }
            style={{ top: 20 }}
            footer={null}
            open={isAddActesModalVisible}
            onCancel={() => {
                setIsAddActesModalVisible(false);
            }}
            destroyOnClose
        >
            <AddActe
                setOpen={setIsAddActesModalVisible}
                onRefresh={onRefresh}
                currentRecord={currentActe}
                operationType={currentActe ? "update" : "add"}
                typePrescription={typePrescription}
            />
        </Modal>
    </div>

}

export default GestionActes;