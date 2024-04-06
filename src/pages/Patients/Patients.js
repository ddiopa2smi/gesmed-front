import React, { useState } from 'react'
import useFetch from '../../utils/hooks/useFetch'
import { endpoints } from '../../constants/endpoints.constants'
import { ClockCircleOutlined, DeleteOutlined, EditOutlined , ExportOutlined, FilterOutlined, FolderOutlined, HomeOutlined, MoreOutlined, PlusOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Typography , Image, Dropdown, Modal ,message, Tooltip } from 'antd'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import test_img from "./../../assets/test_img.jpg"
import { deletePopup, formatDate } from '../../utils/helpers';
import AddPatient from '../../components/specific/AddPatient/AddPatient';
import PatientsAdvancedSearch from '../../components/specific/PatientsAdvancedSearch/PatientsAdvancedSearch';
import AddRv from '../../components/specific/AddRv/AddRv';
import { deleteActions } from '../../actions/actions';
import ExportFile from '../../components/common/ExportFile/ExportFile';
import useSearch from '../../utils/hooks/useSearch';

const {Title} = Typography;

function Patients() {
    const navigate = useNavigate();
    const {data , dataCopy , setDataCopy , isLoading , onRefresh} = useFetch(endpoints.patients.LIST)
    const {getColumnSearchProps} = useSearch()
    const patientsList = data;
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
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

    const onDelete = (record) => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                deleteActions(`${endpoints.patients.DELETE}/${record?.num_patient}`)
                .then((response)=>{
                    if (response.data.Deleted === true) {
                        message.success("Ligne retirée avec succès");
                        onRefresh()
                    }
                })
            }
        })
    }

    const onOpenMedicalFolder = (record) => {
        navigate("/myspace/patients/dossier",{state : {currentPatient : record} , replace : false});
        sessionStorage.setItem("currentPatient",JSON.stringify(record))
    }

    const onCreateRV = (record) => {
        setOperationType("rv");
        setOpen(true);
        setCurrentRecord({...record});
    }

    const onExport = () => {
        setOperationType("exp");
        setOpen(true);
    }

    const onDisplayAdvancedSearch = () => {
        setOperationType("ads");
        setOpen(true);
    }

    
    return (
        <Card>
            <Title level={3} >Liste des patients</Title>

            <Flex justify="flex-end" align="center" >
                <Space>
                    <Tooltip title="Recherche avancée" >
                        <Button type='text' shape="circle" icon={<SearchOutlined/>} onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Tooltip title="Exporter" >
                        <Button type='text' shape="circle" icon={<ExportOutlined/>} onClick={onExport} /> &nbsp;&nbsp;
                    </Tooltip> 	
                    {/* {
                        //tableLoading === false &&
                        dataSourceCopy.length !== 0 &&
                        <>
                            <ExportFile title={title} data={dataSourceCopy} /> &nbsp;&nbsp;
                        </>
                    } */}
                    <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} /> &nbsp;&nbsp;
                    </Tooltip> 
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={patientsList}
                dataSourceCopy={dataCopy}
                setDataSourceCopy={setDataCopy}
                tableLoading={isLoading}
                columns={[
                    {
                        title: '',
                        dataIndex: 'image_patient',
                        render: (record) => <Flex justify="center" align='center' className='table-data' >
                            <Image src={test_img} width={35} height={35} style={{borderRadius:'50%',objectFit:"cover"}} />
                        </Flex> ,
                    
                    },
                    {
                        title: 'N°',
                        dataIndex: 'num_patient',
                        key: 'num_patient',
                        ...getColumnSearchProps('num_patient')
                    },
                    {
                        title: 'Nom',
                        dataIndex: 'nom_patient',
                        key: 'nom_patient',
                        sorter: (a, b) => a.nom_patient.charCodeAt(0) - b.nom_patient.charCodeAt(0),
                        ...getColumnSearchProps('nom_patient')
                    },
                    {
                        title: 'Prénom',
                        dataIndex: 'prenom_patient',
                        key: 'prenom_patient',
                        ...getColumnSearchProps('prenom_patient')
                    },
                    {
                        title: 'Age',
                        dataIndex: 'age_patient',
                        key: 'age_patient',
                        sorter: (a, b) => a.age_patient - b.age_patient,
                        ...getColumnSearchProps('age_patient')
                    },
                    {
                        title: 'Sexe',
                        dataIndex: 'sexe_patient',
                        key: 'sexe_patient'
                    },
                    {
                        title: 'Type',
                        dataIndex: 'type_patient',
                        key: 'type_patient'
                    },
                    {
                        title: 'Date RV',
                        dataIndex: 'date_rv',
                        key: 'date_rv',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                        </div>
                    },
                    {
                        title: 'Date de création',
                        dataIndex: 'date_creation',
                        key: 'date_creation',
                        render: (record) => <div className='table-data'>
                            <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                        </div>
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Dropdown
                                    menu={{items :  
                                        [
                                            {
                                                label: <span style={{textOverflow:"ellipsis"}} > <FolderOutlined/> Ouvrir Dossier Médical </span> ,
                                                key: '0',
                                                onClick : ()=>{onOpenMedicalFolder(record)},
                                            },
                                            {
                                                label: <span> <ClockCircleOutlined/> Créer RV</span> ,
                                                key: '1',
                                                onClick : ()=>{onCreateRV(record)} ,
                                            },
                                            {
                                                label: <span> <EditOutlined/> Modifier </span>,
                                                key: '2',
                                                onClick : ()=>{onEdit(record)} , 
                                            }, 
                                            {
                                                label: <span> <DeleteOutlined/> Supprimer</span> ,
                                                key: '3',
                                                onClick : ()=>{onDelete(record)}
                                            },
                                        ]
                                    }}
                                    trigger={['click']}
                                >
                                    <Button type='text' shape='circle' icon={<MoreOutlined/>} />
                                </Dropdown>
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
                    (operationType === "add" && "Nouveau patient")||
                    (operationType === "update" && "Mettre à jour les données") || 
                    (operationType === "rv" && "Créer un Rendez-vous") ||  
                    (operationType === "ads" && "Recherche avancée") || 
                    (operationType === "exp" && "Exporter le document")  
                } 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose={operationType=== "ads"? false : true}
            >
                {
                    (operationType === "add" || operationType === "update")  && 
                    <AddPatient 
                        setOpen={setOpen}
                        operationType={operationType}
                        onRefresh={onRefresh}
                        currentRecord={currentRecord}
                    />
                }

                {
                    (operationType === "rv") && 
                    <AddRv 
                        setOpen={setOpen} 
                        onRefresh={onRefresh}
                        currentRecord={currentRecord}
                    />
                }

                {
                    (operationType === "ads") && 
                    <PatientsAdvancedSearch 
                        dataSource={patientsList}
                        dataSourceCopy={dataCopy}
                        setDataSourceCopy={setDataCopy}
                        setOpen={setOpen}
                    />
                }

                {
                    (operationType === "exp") && 
                    <ExportFile 
                        title="Liste des patients"
                        data={dataCopy}
                        setOpen={setOpen}
                    />
                }
                
            </Modal>

        </Card>
    )
}

export default Patients