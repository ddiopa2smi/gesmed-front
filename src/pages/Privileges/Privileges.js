import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Flex, Modal, Space, Tabs, Tag, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { deletePopup } from '../../utils/helpers';
import AddPrivilege from '../../components/specific/AddPrivilege/Addprivilege';
import { Link } from 'react-router-dom';
import { LOGO_BROWN } from '../../constants/app.constants.js';


const privileges = [
    {
        role : "Admin",
        key : "admin",
        list_privileges : [

        ]
    },
    {
        role : "Médécin",
        key : "medecin",
        list_privileges : [

        ]
    },
    {
        role : "Infirmier",
        key : "infirmier",
        list_privileges : [

        ]
    },
    {
        role : "Guest",
        key : "guest",
        list_privileges : [

        ]
    },
]
const {Title} = Typography;
    
function Privileges() {
    const navigate = useNavigate();
    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);
    const {data , isLoading , error , onRefresh} = useFetch(endpoints.users.LIST);
    const [dataSourceCopy , setDataSourceCopy] = useState(privileges || []);
    

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
        console.log(record)
        deletePopup()
        .then((result)=>{
            if(result.isConfirmed){
                console.log("OK")
            }
        })
    }

    return (
        <Card>
                
            <Flex justify="flex-end" align="center" flex={"auto"} wrap='wrap' >
                <Space>
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Nouveau</Button>
                </Space>
            </Flex>

            <Title level={3} style={{ color: LOGO_BROWN }} >Liste des privilèges </Title>
            <DataTable 
                dataSource={dataSourceCopy}
                dataSourceCopy={dataSourceCopy}
                setDataSourceCopy={setDataSourceCopy}
                columns={[
                    {
                        title: 'Rôle',
                        dataIndex: 'role',
                        key: 'role'
                    },
                    {
                        title: 'Voir privilèges',
                        dataIndex: 'key',
                        key: 'key',
                        render : (record)=>(
                            <Link to={"/myspace/settings/privileges/privilege"} > {record} </Link>
                        )
                    },
                    
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit(record)}} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{onDelete(record)}} />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />

            

            <Modal
                title={
                    (operationType === "add" && "Nouveau privilège")||
                    (operationType === "update" && "Mettre à jour les données") 
                }
                open={open}
                onCancel={()=>{setOpen(false)}}
                footer={null}
                destroyOnClose
            >
                <AddPrivilege 
                    currentRecord={currentRecord}
                    setOpen={setOpen}
                    operationType={operationType}
                    onRefresh={onRefresh}
                />
            </Modal>

        </Card>
    )
}

export default Privileges