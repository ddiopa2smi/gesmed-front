import { DeleteOutlined, EditOutlined, FilterOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, Card, Flex, Modal, Space, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import DataTable from '../../components/common/DataTable/DataTable'
import { formatDate } from '../../utils/helpers'
const {Title} = Typography
function Facturation() {
    const [operationType, setOperationType] = useState(null);
    const [open , setOpen] = useState(false);
    const [currentRecord , setCurrentRecord] = useState(null);

    const onAdd = () => {
        setOperationType("add");
        setOpen(true);
    }
    
    const onEdit = (record) => {
        setOperationType("update");
        setOpen(true);
        setCurrentRecord({...record});
    }

    return (
        <Card /*loading={isLoading}*/ >

            <Title level={3} > Facturation </Title>

            <Flex justify="flex-end" align="center" >
                <Space size="middle" >
                    <Tooltip title="Actualiser" >
                        <Button type='text' shape="default" icon={<ReloadOutlined/>} /*onClick={onRefresh}*/ /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Button type='primary' ghost icon={<FilterOutlined />} onClick={()=>{}} >Filtrer</Button>
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>

                </Space>
            </Flex>

            <br/>     
            
            <DataTable 
                dataSource={[]}
                dataSourceCopy={[
                    {
                        key: '1',
                        code_facture: 'FAC12345',
                        code_produit: 'PROD67890',
                        nom_patient: 'Jean Dupont',
                        pu: 150.00,  // Prix unitaire
                        pt: 300.00,  // Prix total
                        date_visite: '2024-10-18',
                    },
                    {
                        key: '2',
                        code_facture: 'FAC67891',
                        code_produit: 'PROD11234',
                        nom_patient: 'Marie Martin',
                        pu: 100.00,
                        pt: 200.00,
                        date_visite: '2024-10-17',
                    }
                ]}
                setDataSourceCopy={null}
                //tableLoading={isLoading}
                columns={[
                    {
                        title: 'Code facture',
                        dataIndex: 'code_facture',
                        key: 'code_facture',
                        render: (record) => <div className='table-data'>
                                {formatDate(record)} 
                        </div>,
                    },
                    {
                        title: 'Code produit',
                        dataIndex: 'code_produit',
                        key: 'code_produit',
                        sorter: (a, b) => a.code_produit.charCodeAt(0) - b.code_produit.charCodeAt(0),
                    },
                    {
                        title: 'Patient',
                        dataIndex: 'nom_patient',
                        key: 'nom_patient',
                        sorter: (a, b) => a.nom_patient.charCodeAt(0) - b.nom_patient.charCodeAt(0),
                    },
                    {
                        title: 'Prix unitaire',
                        dataIndex: 'pu',
                        key: 'pu',
                    },
                    {
                        title: 'Prix total',
                        dataIndex: 'pt',
                        key: 'pt',
                    },
                    {
                        title: 'Date',
                        dataIndex: 'date_visite',
                        key: 'date_visite',
                        render: (record) => <div className='table-data'>
                                {formatDate(record)} 
                        </div>,
                    },
                    {
                        render :  (record)=>(
                            <Flex justify="center" align="center" >
                                <Space>
                                    <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} /*onClick={()=>{onEdit(record)}}*/ />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined/>} /*onClick={()=>{ onDelete(record) }}*/ />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />
            

            <Modal 
                title={
                    (operationType === "add" && "Nouvelle facturation")||
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
                {/* <AddVisite 
                    setOpen={setOpen} 
                    operationType={operationType}
                    onRefresh={onRefresh}
                    currentRecord={currentRecord}
                /> */}
                Facturation
            </Modal>
        </Card>
    )
}

export default Facturation