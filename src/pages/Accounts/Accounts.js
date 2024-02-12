import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Flex, Modal, Space, Tabs, Tag, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { Can } from '../../utils/contexts/AbilityContext';
import { ability } from '../../utils/access';



const {Title} = Typography;
    
function Accounts() {
    const navigate = useNavigate();
    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
    const [open , setOpen] = useState(false);
    const {data , isLoading , error} = useFetch(endpoints.users.LIST);
    const [dataSourceCopy , setDataSourceCopy] = useState([]);
    //const usersList = data;
    const usersListWithoutOwnAccount = data.filter(element => element?.login !== userConnected.login);
    const personnelMedicalList = usersListWithoutOwnAccount.filter(element=>element?.perim === 'MED');
    const personnelPharmacieList = usersListWithoutOwnAccount.filter(element=>element?.perim === 'PH');
    

    const onAdd = (type) => {
        navigate("/myspace/settings/accounts/account",{replace : false , state : { type : type}});
    }

    const onEdit = (type , record) => {
        navigate("/myspace/settings/accounts/account",{replace : false , state : {currentAccount : record , type : type}});
    }

    const onDelete = (record) => {
        console.log(record)
    }

    return (
        <Card>
                
            <Flex justify="flex-end" align="center" flex={"auto"} wrap='wrap' >
                <Space>
                    <Can I="create" an="account" >
                        <Dropdown
                            menu={{
                                items : [
                                    {
                                        key : 'personnel-medical' ,
                                        label : "Personnel médical" ,
                                        onClick : (e)=>{onAdd(e.key)}
                                    } ,
                                    {
                                        key : 'personnel-non-medical' ,
                                        label : "Personnel non-médical" ,
                                        onClick :  (e)=>{onAdd(e.key)}
                                    } ,
                                    {
                                        key : 'personnel-pharmacie' ,
                                        label : "Personnel pharmacie" ,
                                        onClick :  (e)=>{onAdd(e.key)}
                                    } ,
                                ] ,
                            }}
                        >
                            <Button type='primary' icon={<PlusOutlined/>}>Nouveau</Button>
                        </Dropdown>
                    </Can>
                </Space>
            </Flex>

            <Tabs defaultActiveKey={"1"} items={[
                {
                    key: '1',
                    label: "Personnel médical",
                    children:  <>
                        <Title level={3} >Liste du personnel médical</Title>
                        <DataTable 
                            dataSource={personnelMedicalList}
                            dataSourceCopy={personnelMedicalList}
                            setDataSourceCopy={setDataSourceCopy}
                            columns={[
                                {
                                    title: 'Login',
                                    dataIndex: 'login',
                                    key: 'login'
                                },
                                {
                                    title: 'Nom complet',
                                    dataIndex: 'username',
                                    key: 'username',
                                    sorter: (a, b) => a.username.charCodeAt(0) - b.username.charCodeAt(0)
                                },
                                {
                                    title: 'Email',
                                    dataIndex: 'emailaddress',
                                    key: 'emailaddress'
                                },
                                {
                                    title: 'Etat',
                                    dataIndex: 'etat',
                                    key: 'etat',
                                    render: (record) => <div className='table-data'>
                                        {
                                            record === true ?
                                            <Tag color="green" >Actif</Tag> : 
                                            <Tag color="red" >Non actif</Tag>
                                        }
                                    </div>
                                },
                                {
                                    title: 'Rôle',
                                    dataIndex: 'role_name',
                                    key: 'role_name'
                                },
                                {
                                    render :  (record)=>(
                                        <Flex align='center' >
                                            <Space size="middle" >
                                                <Can  I="update" an="account">
                                                    <Tooltip title="Editer">
                                                        <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit( "personnel-medical" , record)}} />
                                                    </Tooltip>
                                                </Can>
                                                <Can I="delete" an="account">
                                                    <Tooltip title="Supprimer">
                                                        <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{onDelete(record)}} />
                                                    </Tooltip>
                                                </Can>
                                            </Space>
                                        </Flex>
                                    )
                                }
                            ]}
                        />
                    </>
                },
                {
                    key: '2',
                    label: "Personnel pharmacie",
                    children:  <>
                        <Title level={3} >Liste du personnel de la pharmacie</Title>
                        <DataTable 
                            dataSource={personnelPharmacieList}
                            dataSourceCopy={personnelPharmacieList}
                            setDataSourceCopy={setDataSourceCopy}
                            columns={[
                                {
                                    title: 'Login',
                                    dataIndex: 'login',
                                    key: 'login'
                                },
                                {
                                    title: 'Nom complet',
                                    dataIndex: 'username',
                                    key: 'username',
                                    sorter: (a, b) => a.username.charCodeAt(0) - b.username.charCodeAt(0)
                                },
                                {
                                    title: 'Email',
                                    dataIndex: 'emailaddress',
                                    key: 'emailaddress'
                                },
                                {
                                    title: 'Etat',
                                    dataIndex: 'etat',
                                    key: 'etat',
                                    render: (record) => <div className='table-data'>
                                        {
                                            record === true ?
                                            <Tag color="green" >Actif</Tag> : 
                                            <Tag color="red" >Non actif</Tag>
                                        }
                                    </div>
                                },
                                {
                                    title: 'Rôle',
                                    dataIndex: 'role_name',
                                    key: 'role_name'
                                },
                                {
                                    render :  (record)=>(
                                        <Flex align='center' >
                                            <Space size="middle" >
                                                <Tooltip title="Editer">
                                                    <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit( "personnel-pharmacie" , record)}} />
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
                    </>
                },
            ]} />

            

            <Modal
                open={open}
                onCancel={()=>{setOpen(false)}}
                footer={null}
                destroyOnClose
            >
                
            </Modal>

        </Card>
    )
}

export default Accounts