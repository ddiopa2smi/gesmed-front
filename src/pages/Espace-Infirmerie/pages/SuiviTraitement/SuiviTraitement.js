import { Button, Card, Dropdown, Flex, Space, Typography } from "antd";
import React, { useState } from "react";
import SearchBar from "../../../../components/common/SearchBar/SearchBar";
import AdvancedSearchButton from "../../../../components/common/AdvancedSearchButton/AdvancedSearchButton";
import ReloadButton from "../../../../components/common/ReloadButton/ReloadButton";
import ExcellExportButton from "../../../../components/common/ExcellExportButton/ExcellExportButton";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import useSearch from "../../../../utils/hooks/useSearch";
import DataTable from "../../../../components/common/DataTable/DataTable";
import { formatDate } from "../../../../utils/helpers";

const { Title } = Typography;
function SuiviTraitement() {
  const navigate = useNavigate();
  const {getColumnSearchProps} = useSearch();
  const [isLoading , setIsloading] = useState(false)
  const [traitementsList , setTraitementsList] = useState([]);
  const addNewTreatment = () => {
    navigate("/espace-infirmerie/suivi-traitement/new-treatment");
  };
  return (
    <Card>
      <Title level={3}>Suivi des traitements</Title>
      <Flex justify="space-between" align="center">
        <Space size="large">
          <SearchBar
            data={[]}
            setDataCopy={null}
            listKeys={["num_patient", "nom_patient", "prenom_patient"]}
          />
          <AdvancedSearchButton onClick={null} />
        </Space>
        <Space size="large">
          <ReloadButton onRefresh={null} />
          <ExcellExportButton onClick={null} />
          <Button type="primary" icon={<PlusOutlined />} onClick={addNewTreatment}>
            Nouveau traitement
          </Button>
        </Space>
      </Flex>
      <br />

      <DataTable
        dataSource={traitementsList}
        dataSourceCopy={traitementsList}
        setDataSourceCopy={setTraitementsList}
        tableLoading={isLoading}
        rowKey={(record) => record.num_patient}
        //rowSelected
        columns={[
          {
            title: "Nom du traitement",
            dataIndex: "nom_traitement",
            key: "nom_traitement",
            ...getColumnSearchProps("nom_traitement"),
          },
          {
            title: "Doses administrées",
            dataIndex: "doses",
            key: "doses",
            ...getColumnSearchProps("doses"),
          },
          {
            title: "Fréquence d'administration",
            dataIndex: "frequence",
            key: "frequence",
            ...getColumnSearchProps("frequence"),
          },
          {
            title: "Durée du traitement",
            dataIndex: "duree",
            key: "duree",
          },
          {
            title: "Infirmier/Soignant",
            dataIndex: "infirmier",
            key: "infirmier",
            ...getColumnSearchProps("infirmier"),
          },
          {
            title: "Observations",
            dataIndex: "observations",
            key: "observations",
          },
          {
            render: (record) => (
              <Flex align="center">
                <Dropdown
                  menu={{
                    items: [
                      {
                        label: "Modifier",
                        key: "1",
                        onClick: () => {
                          console.log(record);
                        },
                      },
                      {
                        label: "Supprimer",
                        key: "2",
                        onClick: () => {
                          console.log(record);
                        },
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
    </Card>
  );
}

export default SuiviTraitement;
