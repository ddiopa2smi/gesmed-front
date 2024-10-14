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
function Consultations() {
  const navigate = useNavigate();
  const {getColumnSearchProps} = useSearch();
  const [isLoading , setIsloading] = useState(false)
  const [consultationsList , setConsultationsList] = useState([]);
  const consult = () => {
    navigate("/espace-infirmerie/consultations/new-consultation");
  };
  return (
    <Card>
      <Title level={3}>Liste des consultations</Title>
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
          <Button type="primary" icon={<PlusOutlined />} onClick={consult}>
            Consulter
          </Button>
        </Space>
      </Flex>
      <br />

      <DataTable
        dataSource={consultationsList}
        dataSourceCopy={consultationsList}
        setDataSourceCopy={setConsultationsList}
        tableLoading={isLoading}
        rowKey={(record) => record.num_patient}
        //rowSelected
        columns={[
          {
            title: "Date de consultation",
            dataIndex: "date_consultation",
            key: "date_consultation",
            render: (record) => (
              <div className="table-data">
                <span style={{ textOverflow: "ellipsis" }}>
                  {formatDate(record)}
                </span>
              </div>
            ),
          },
          {
            title: "Infirmier responsable",
            dataIndex: "infirmier",
            key: "infirmier",
            ...getColumnSearchProps("infirmier"),
          },
          {
            title: "N°",
            dataIndex: "num_patient",
            key: "num_patient",
            ...getColumnSearchProps("num_patient"),
          },
          {
            title: "Nom",
            dataIndex: "nom_patient",
            key: "nom_patient",
            sorter: (a, b) =>
              a.nom_patient.charCodeAt(0) - b.nom_patient.charCodeAt(0),
            ...getColumnSearchProps("nom_patient"),
          },
          {
            title: "Prénom",
            dataIndex: "prenom_patient",
            key: "prenom_patient",
            ...getColumnSearchProps("prenom_patient"),
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

export default Consultations;
