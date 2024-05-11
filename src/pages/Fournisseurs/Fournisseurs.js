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




const {Title} = Typography;
    
function Fournisseurs() {
    // const navigate = useNavigate();
    
    const {data , dataCopy : listFournisseurs , onRefresh : refreshListFournisseurs , isLoading : listLoading} = useFetch();

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

            <Flex justify="flex-end" align="center" >
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
                dataSource={[]}
                dataSourceCopy={[]}
                setDataSourceCopy={null}
                columns={[
                    {
                        title: 'N°',
                        dataIndex: 'num_fourn',
                        key: 'num_fourn'
                    },
                    {
                        title: 'Raison sociale',
                        dataIndex: 'raisoc',
                        key: 'raisoc'
                    },
                    {
                        title: 'Adresse',
                        dataIndex: 'adresse',
                        key: 'adresse'
                    },
                    {
                        title: 'Téléphone',
                        dataIndex: 'telephone',
                        key: 'telephone'
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
                                    <Tooltip title="Editer">
                                        <Button type='link' icon={<EditOutlined/>} />
                                    </Tooltip>
                                    <Tooltip title="Supprimer">
                                        <Button type='link' danger icon={<DeleteOutlined/>} />
                                    </Tooltip>
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />


            <Modal 
                // styles={{
                //     header : {
                //         background : "red"
                //     }
                // }}
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