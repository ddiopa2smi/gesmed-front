import { DeleteOutlined, EditOutlined, HomeOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Modal, Space, Tooltip, Typography } from 'antd'
import React, { useState } from 'react'
//import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { deletePopup } from '../../utils/helpers';
import { deleteActions } from '../../actions/actions';
import AddFournisseur from '../../components/specific/AddFournisseur/AddFournisseur';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import { endpoints } from '../../constants/endpoints.constants';
import EditButton from '../../components/common/EditButton/EditButton';
import DeleteButton from '../../components/common/DeleteButton/DeleteButton';
import SearchBar from '../../components/common/SearchBar/SearchBar';




const {Title} = Typography;
    
function Fournisseurs() {
    // const navigate = useNavigate();
    
    const {data : listFournisseurs , dataCopy : listFournisseursCopy , setDataCopy : setListFournisseursCopy ,  onRefresh : refreshListFournisseurs , isLoading : listLoading} = useFetch(endpoints.fournisseurs.LIST);
    //console.log(listFournisseurs)
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);


    //console.log(data)


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
            if (result.isConfirmed) {
                console.log("Must delete")
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
           

            <Title level={3} >Liste des fournisseurs</Title>

            <Flex justify="space-between" align="center" >
                <Space>
                    <SearchBar 
                        data={listFournisseurs}
                        setDataCopy={setListFournisseursCopy}
                        listKeys={['fourn_code','fourn_raisoc','adresse','tel_portable','email']}
                    />
                </Space>
                <Space>
                    {/* <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={refreshListFournisseurs} /> &nbsp;&nbsp;
                    </Tooltip>  */}
                    <ReloadButton onRefresh={refreshListFournisseurs} />
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={listFournisseurs}
                dataSourceCopy={listFournisseursCopy}
                setDataSourceCopy={setListFournisseursCopy}
                columns={[
                    {
                        title: 'N°',
                        dataIndex: 'fourn_code',
                        key: 'fourn_code'
                    },
                    {
                        title: 'Raison sociale',
                        dataIndex: 'fourn_raisoc',
                        key: 'fourn_raisoc'
                    },
                    {
                        title: 'Adresse',
                        dataIndex: 'adresse',
                        key: 'adresse'
                    },
                    {
                        title: 'Tél. portable',
                        dataIndex: 'tel_portable',
                        key: 'tel_portable'
                    },
                    {
                        title: 'Email',
                        dataIndex: 'email',
                        key: 'email'
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Space size="middle" >
                                    <EditButton onEdit={()=>{onEdit(record)}} />
                                    <DeleteButton onDelete={()=>{ onDelete(record) }} />
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />


            <Modal 
                title={
                    (operationType === "add" && "Nouveau fournisseur")||
                    (operationType === "update" && "Mettre à jour les données")
                } 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose={true}
            >
                <AddFournisseur 
                    setOpen={setOpen}
                    operationType={operationType}
                    onRefresh={refreshListFournisseurs}
                    currentRecord={currentRecord}
                />
                
            </Modal>

        </Card>
    )
}

export default Fournisseurs