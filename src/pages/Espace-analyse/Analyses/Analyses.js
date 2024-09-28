import React, { useState } from 'react'
import { formatDate } from '../../../utils/helpers';
import DataTable from '../../../components/common/DataTable/DataTable';
import EditButton from '../../../components/common/EditButton/EditButton';
import DeleteButton from '../../../components/common/DeleteButton/DeleteButton';
import { Button, Flex, Space, Tag, Tooltip, Typography } from 'antd';
import {RiStethoscopeLine} from "react-icons/ri"

const {Title} = Typography
function Analyses() {
    const [isLoading , setLoading] = useState(false);
    const listPrescription = [
        {
            numpresc : "ANA01213",
            datepresc : new Date().toISOString(),
            prescripteur: "ddiop",
            traite : false
        },
        {
            numpresc : "ANA01214",
            datepresc : new Date().toISOString(),
            prescripteur: "david",
            traite : false
        },
    ]
  return (
    <div>
      <Title level={4}>
            Liste des analyses à faire
        </Title>
        <br />
        <DataTable
            dataSourceCopy={
                listPrescription || []
            }
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
                render: (record) => (
                    <Tag color='red' > Non traité </Tag>
                )
            },
            {
                width: "auto",
                render: (record) => (
                <Flex justify="center" align="center">
                    <Space>
                        <Tooltip title="Traiter">
                            <RiStethoscopeLine cursor="pointer" size={18} onClick={()=>{console.log("Traiter")}} />
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
  )
}

export default Analyses
