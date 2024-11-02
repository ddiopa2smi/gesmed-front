import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Modal,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import { useNavigate } from "react-router";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import { Can } from "../../utils/contexts/AbilityContext";
import BackButton from "../../components/common/BackButton/BackButton";

const { Title } = Typography;

function Accounts() {
  const navigate = useNavigate();
  const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
  const [open, setOpen] = useState(false);
  const { data, dataCopy, setDataCopy, isLoading , onRefresh } = useFetch(
    endpoints.users.LIST
  );

  const onAdd = () => {
    navigate("/myspace/settings/accounts/account", {
      replace: false,
    });
  };

  const onEdit = (record) => {
    navigate("/myspace/settings/accounts/account", {
      replace: false,
      state: { currentAccount: record },
    });
  };

  const onDelete = (record) => {
    alert("delete");
  };

  return (
    <Card>
        
        <Flex justify="flex-end" align="center" flex={"auto"} wrap="wrap">
            <Space>
                <Button type="primary" icon={<ReloadOutlined />} onClick={onRefresh} ghost>
                    Actualiser
                </Button>
                <Can I="create" an="account">
                    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
                    Nouveau
                    </Button>
                </Can>
            </Space>
        </Flex>

        <>
            <Title level={3}>Liste du personnel médical</Title>
            <DataTable
            tableLoading={isLoading}
            dataSource={data}
            dataSourceCopy={dataCopy.filter(
                (element) => element?.login !== userConnected.login && element?.perim === "MED"
            )}
            setDataSourceCopy={setDataCopy}
            columns={[
                {
                title: "Login",
                dataIndex: "login",
                key: "login",
                },
                {
                title: "Nom complet",
                dataIndex: "username",
                key: "username",
                sorter: (a, b) =>
                    a.username.charCodeAt(0) - b.username.charCodeAt(0),
                },
                {
                title: "Email",
                dataIndex: "emailaddress",
                key: "emailaddress",
                },
                {
                title: "Etat",
                dataIndex: "etat",
                key: "etat",
                render: (record) => (
                    <div className="table-data">
                    {record === true ? (
                        <Tag color="green">Actif</Tag>
                    ) : (
                        <Tag color="red">Non actif</Tag>
                    )}
                    </div>
                ),
                },
                {
                title: "Profil",
                dataIndex: "role_name",
                key: "role_name",
                },
                {
                title: "Service",
                dataIndex: "lib_service",
                key: "lib_service",
                },
                {
                render: (record) => (
                    <Flex align="center">
                    <Space size="middle">
                        <Can I="update" an="account">
                        <Tooltip title="Editer">
                            <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => {
                                onEdit(record);
                            }}
                            />
                        </Tooltip>
                        </Can>
                        <Can I="delete" an="account">
                        <Tooltip title="Supprimer">
                            <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => {
                                onDelete(record);
                            }}
                            />
                        </Tooltip>
                        </Can>
                    </Space>
                    </Flex>
                ),
                },
            ]}
            />
        </>

        <Modal
            open={open}
            onCancel={() => {
            setOpen(false);
            }}
            footer={null}
            destroyOnClose
        ></Modal>
    </Card>
  );
}

export default Accounts;
