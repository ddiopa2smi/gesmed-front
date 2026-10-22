import { Button } from "antd";
import DataTable from "../../common/DataTable/DataTable";

function GestionActes({
    listActes,

}) {

    const [listActesCopy, setListActesCopy] = useState(listActes);


    return <div>
        <DataTable compact
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
                    ...getColumnSearchProps("categorie"),
                    sorter: (a, b) =>
                        a.categorie.charCodeAt(0) - b.categorie.charCodeAt(0),
                    ...getColumnSearchProps("categorie"),
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
                                <Button type="text" icon={<MoreOutlined />} />
                            </Dropdown>
                        </Flex>
                    ),
                },
            ]}
        />
    </div>

}