import { DeleteOutlined, EditOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons'
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
                <Space>
                    <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} /*onClick={onRefresh}*/ /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>     
            
            <DataTable 
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                //tableLoading={isLoading}
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