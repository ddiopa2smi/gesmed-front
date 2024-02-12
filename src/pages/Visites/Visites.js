import React, { useState } from 'react'
import { Breadcrumb, Button, Card, Flex, Modal, Space, Tooltip, Typography} from "antd"
import { useNavigate } from 'react-router';
import { HomeOutlined , ExclamationCircleFilled, EditOutlined, DeleteOutlined, SearchOutlined, ExportOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { deleteActions, getActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import { tableTypes } from '../../constants/app.constants';
import useFetch from '../../utils/hooks/useFetch';
import { deletePopup, formatDate } from '../../utils/helpers';
import DataTable from '../../components/common/DataTable/DataTable';
import AddVisite from '../../components/specific/AddVisite/AddVisite';

const { Title } = Typography;

function Visites() {
    const navigate = useNavigate();
    const {data , dataCopy , setDataCopy , isLoading , onRefresh } = useFetch(endpoints.visitesLieux.LIST);
    const [operationType , setOperationType] = useState(null);
    const [open , setOpen]=useState(false);
    const [currentRecord , setCurrentRecord] = useState({});

    const onAdd = () => {
        setOperationType("add");
        setOpen(true);
    }
    const onEdit = (record) => {

        setOperationType("update");
        setOpen(true);
        setCurrentRecord({...record});
    }

    const onDelete = (record) => {
        deletePopup()
        .then((result)=>{
            // if (result.isConfirmed) {
            //     deleteActions(`${endpoints.visitesLieux.}/${record?.num_patient}`)
            //     .then((response)=>{
            //         if (response.data.Deleted === true) {
            //             message.success("Ligne retirée avec succès");
            //             onRefresh()
            //         }
            //     })
            // }
        })
    }


    return (
        <Card loading={isLoading} >

            <Title level={3} > Visite des lieux </Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Tooltip title="Recherche avancée" >
                        <Button type='text' shape="circle" icon={<SearchOutlined/>}  /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Tooltip title="Exporter" >
                        <Button type='text' shape="circle" icon={<ExportOutlined/>}  /> &nbsp;&nbsp;
                    </Tooltip>
                    <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>     
            
            <DataTable 
                dataSource={data}
                dataSourceCopy={dataCopy}
                setDataSourceCopy={setDataCopy}
                tableLoading={isLoading}
                columns={[
                    {
                        title: 'Date',
                        dataIndex: 'date_visite',
                        key: 'date_visite',
                        render: (record) => <div className='table-data'>
                                {formatDate(record)} 
                        </div>,
                    },
                    {
                        title: 'Lieu',
                        dataIndex: 'lieu_visite',
                        key: 'lieu_visite',
                        sorter: (a, b) => a.lieu_visite.charCodeAt(0) - b.lieu_visite.charCodeAt(0),
                    },
                    {
                        title: 'Nature',
                        dataIndex: 'nature_visite',
                        key: 'nature_visite'
                    },
                    {
                        render :  (record)=>(
                            <Flex justify="center" align="center" >
                                <Space>
                                    <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit(record)}} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />
            

            <Modal 
                title={
                    (operationType === "add" && "Nouvelle visite")||
                    (operationType === "update" && "Mettre à jour les données")
                } 
                open={open}
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <AddVisite 
                    setOpen={setOpen} 
                    operationType={operationType}
                    onRefresh={onRefresh}
                    currentRecord={currentRecord}
                />
            </Modal>
        </Card>
    )
}

export default Visites