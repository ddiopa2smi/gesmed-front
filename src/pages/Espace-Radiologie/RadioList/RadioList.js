import React, { useState } from "react";
import { formatDate } from "../../../utils/helpers";
import DataTable from "../../../components/common/DataTable/DataTable";
import EditButton from "../../../components/common/EditButton/EditButton";
import DeleteButton from "../../../components/common/DeleteButton/DeleteButton";
import { Button, Flex, Space, Tag, Tooltip, Typography } from "antd";
import { RiStethoscopeLine } from "react-icons/ri";
import { EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title } = Typography;
function RadioList() {
  const navigate = useNavigate();
  const [isLoading, setLoading] = useState(false);
  const listPrescription = [
    {
      numpresc: "IMG01213",
      datepresc: new Date().toISOString(),
      prescripteur: "ddiop",
      traite: false,
    },
    {
      numpresc: "IMG01214",
      datepresc: new Date().toISOString(),
      prescripteur: "david",
      traite: false,
    },
  ];

  const viewDetails = (id) => {
    navigate(`/espace-radiologie/radiologies/details/${id}`)
  };
  return (
    <div>
      <Title level={4}>Liste des radiologies à faire</Title>
      <br />
      <DataTable
        dataSourceCopy={listPrescription || []}
        tableLoading={isLoading}
        rowKey={(record) => record.numpresc}
        columns={[
          {
            title: "N° analyse.",
            dataIndex: "numpresc",
            key: "numpresc",
          },
          {
            title: "Date presc",
            dataIndex: "datepresc",
            key: "datepresc",
            // ...getColumnSearchProps("datepresc"),
            render: (record) => (
              <div className="table-data">{formatDate(record)}</div>
            ),
          },
          {
            title: "Prescripteur",
            dataIndex: "prescripteur",
            key: "prescripteur",
            // ...getColumnSearchProps("medecin"),
            sorter: (a, b) =>
              a.medecin?.charCodeAt(0) - b.medecin?.charCodeAt(0),
            //sortOrder: sortedInfo.columnKey === 'medecin' ? sortedInfo.order : null
          },
          {
            title: "Status",
            dataIndex: "traite",
            render: (record) => <Tag color="red"> Non traité </Tag>,
          },
          {
            width: "auto",
            render: (record) => (
              <Flex justify="center" align="center">
                <Space>
                  <Tooltip title="Traiter">
                    <Button
                      type="text"
                      icon={<RiStethoscopeLine cursor="pointer" size={18} />}
                      onClick={() => {
                        console.log("Traiter");
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Voir">
                    <Button
                      type="text"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        viewDetails("1")
                      }}
                    />
                  </Tooltip>
                  <EditButton
                    onEdit={() => {
                      console.log("Edit");
                    }}
                  />
                  <DeleteButton
                    onDelete={() => {
                      console.log("Delete");
                    }}
                  />
                </Space>
              </Flex>
            ),
          },
        ]}
      />
    </div>
  );
}

export default RadioList;
