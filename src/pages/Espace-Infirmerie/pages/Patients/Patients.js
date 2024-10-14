import React, { useState } from 'react'
import useFetch from '../../../../utils/hooks/useFetch'
import { endpoints } from '../../../../constants/endpoints.constants'
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Flex, Space, Typography , Image, Dropdown, Modal ,message, Tooltip, Input } from 'antd'
import { useNavigate } from 'react-router';
import DataTable from '../../../../components/common/DataTable/DataTable';
import test_img from "./../../../../assets/test_img.jpg"
import { deletePopup, formatDate, getTypePatient } from '../../../../utils/helpers';
import AddPatient from '../../../../components/specific/AddPatient/AddPatient';
import PatientsAdvancedSearch from '../../../../components/specific/PatientsAdvancedSearch/PatientsAdvancedSearch';
import AddRv from '../../../../components/specific/AddRv/AddRv';
import { deleteActions } from '../../../../actions/actions';
import ExportFile from '../../../../components/common/ExportFile/ExportFile';
import useSearch from '../../../../utils/hooks/useSearch';
import ReloadButton from '../../../../components/common/ReloadButton/ReloadButton';
import ExcellExportButton from '../../../../components/common/ExcellExportButton/ExcellExportButton';
import AdvancedSearchButton from '../../../../components/common/AdvancedSearchButton/AdvancedSearchButton';
import SearchBar from '../../../../components/common/SearchBar/SearchBar';


const {Title , Text} = Typography;

function Patients() {
    const navigate = useNavigate();
    const {data , dataCopy , setDataCopy , isLoading , onRefresh} = useFetch(endpoints.patients.LIST)
    const {getColumnSearchProps} = useSearch()
    const patientsList = data;
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);

    const onAdd = () => {
        setCurrentRecord(null);
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

            <Flex justify="space-between" align="center" >

                <Space>
                    <SearchBar 
                        data={data}
                        setDataCopy={setDataCopy}
                        listKeys={['num_patient','nom_patient','prenom_patient']}
                    />
                    <AdvancedSearchButton onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                </Space>
                <Space size="large" >
                    <ReloadButton onRefresh={onRefresh} />
                    <ExcellExportButton onClick={onExport} />
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={patientsList}
                dataSourceCopy={dataCopy}
                setDataSourceCopy={setDataCopy}
                tableLoading={isLoading}
                rowKey={(record)=>record.num_patient}
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
                        title: 'Téléphone',
                        dataIndex: 'tel_patient',
                        key: 'tel_patient',
                        ...getColumnSearchProps('tel_patient')
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
                        key: 'type_patient',
                        render: (record) => <div className='table-data'>
                            <Text ellipsis > {getTypePatient(record)} </Text>
                        </div>
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
                                                label: "Ouvrir Dossier Médical" ,
                                                key: '0',
                                                onClick : ()=>{onOpenMedicalFolder(record)},
                                            },
                                            {
                                                label: "Créer RV" ,
                                                key: '1',
                                                onClick : ()=>{onCreateRV(record)} ,
                                            },
                                            {
                                                label: "Modifier",
                                                key: '2',
                                                onClick : ()=>{onEdit(record)} , 
                                            }, 
                                            {
                                                label: "Supprimer" ,
                                                key: '3',
                                                onClick : ()=>{onDelete(record)}
                                            },
                                        ]
                                    }}
                                    trigger={['click']}
                                >
                                    <Button type='text' icon={<MoreOutlined/>} />
                                </Dropdown>
                            </Flex>
                        )
                    }
                ]}
            />

            <Modal 
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