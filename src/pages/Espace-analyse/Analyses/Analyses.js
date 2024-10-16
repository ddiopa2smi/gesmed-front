import React, { useState } from 'react'
import { deletePopup, formatDate } from '../../../utils/helpers';
import DataTable from '../../../components/common/DataTable/DataTable';
import EditButton from '../../../components/common/EditButton/EditButton';
import DeleteButton from '../../../components/common/DeleteButton/DeleteButton';
import { Button, Card, Flex, message, Space, Tag, Tooltip, Typography } from 'antd';
import {RiStethoscopeLine} from "react-icons/ri"
import { deleteActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import { useNavigate } from 'react-router';

const {Title} = Typography
function Analyses() {
    const navigate = useNavigate();
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

    const doTreatment = (id) => {
        navigate(`/espace-analyse/analyses/details/${id}`)
    };

    const onDelete = (id) => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                alert("Confirmed")
                // deleteActions(`${endpoints.patients.DELETE}/${record?.num_patient}`)
                // .then((response)=>{
                //     if (response.data.Deleted === true) {
                //         message.success("Ligne retirée avec succès");
                //         onRefresh()
                //     }
                // })
            }
        })
    }
  return (
    <Card>
      <Title level={3}>
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
                            <Button onClick={()=>{doTreatment(record.numpresc)}} type='text' icon={<RiStethoscopeLine cursor="pointer" size={18} onClick={()=>{console.log("Traiter")}} />} />
                        </Tooltip>
                        {/* <EditButton
                            onEdit={() => {
                            console.log("Edit");
                            }}
                        /> */}
                        <DeleteButton
                            onDelete={() => {
                                onDelete(record.numpresc);
                            }}
                        />
                    </Space>
                </Flex>
                ),
            },
            ]}
        />
    </Card>
  )
}

export default Analyses
