import React, { useState , useEffect } from 'react'
import useFetch from '../../../utils/hooks/useFetch'
import { endpoints } from '../../../constants/endpoints.constants'
import { ClockCircleOutlined, DeleteOutlined, EditOutlined , ExportOutlined, FilterOutlined, FolderOutlined, HomeOutlined, MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { Breadcrumb, Button, Card, Flex, Space, Typography , Image, Dropdown, Modal ,message, Tooltip, Input, Tag } from 'antd'
import { useNavigate } from 'react-router';
import DataTable from '../../../components/common/DataTable/DataTable';
import { deletePopup, formatDate, getTypePatient } from '../../../utils/helpers';
import AddPatient from '../../../components/specific/AddPatient/AddPatient';
import PatientsAdvancedSearch from '../../../components/specific/PatientsAdvancedSearch/PatientsAdvancedSearch';
import AddRv from '../../../components/specific/AddRv/AddRv';
import { deleteActions } from '../../../actions/actions';
import ExportFile from '../../../components/common/ExportFile/ExportFile';
import useSearch from '../../../utils/hooks/useSearch';
import { IoFilter } from "react-icons/io5";
import ReloadButton from '../../../components/common/ReloadButton/ReloadButton';
import ExcellExportButton from '../../../components/common/ExcellExportButton/ExcellExportButton';
import AdvancedSearchButton from '../../../components/common/AdvancedSearchButton/AdvancedSearchButton';
import SearchBar from '../../../components/common/SearchBar/SearchBar';
import AddTreatment from '../components/AddTreatment/AddTreatment';


const {Title , Text} = Typography;

const data = [
    // {
    //   key: '1',
    //   nom_traitement: 'Consultation générale',
    //   prix: 50,
    //   duration_estimation: '30 min',
    //   visite_type: 'Première visite',
    // },
    // {
    //   key: '2',
    //   nom_traitement: 'Blanchiment des dents',
    //   prix: 200,
    //   duration_estimation: '1h',
    //   visite_type: 'Visite de suivi',
    // },
    // {
    //   key: '3',
    //   nom_traitement: 'Détartrage',
    //   prix: 80,
    //   duration_estimation: '45 min',
    //   visite_type: 'Première visite',
    // },
    // {
    //   key: '4',
    //   nom_traitement: 'Extraction dentaire',
    //   prix: 150,
    //   duration_estimation: '1h 30 min',
    //   visite_type: 'Urgence',
    // },
    // {
    //   key: '5',
    //   nom_traitement: 'Couronne dentaire',
    //   prix: 500,
    //   duration_estimation: '2h',
    //   visite_type: 'Visite de suivi',
    // }
];
  
const dataCopy = [
    // {
    //   key: '1',
    //   nom_traitement: 'Consultation générale',
    //   prix: 50,
    //   duration_estimation: '30 min',
    //   visite_type: 'Première visite',
    // },
    // {
    //   key: '2',
    //   nom_traitement: 'Blanchiment des dents',
    //   prix: 200,
    //   duration_estimation: '1h',
    //   visite_type: 'Visite de suivi',
    // },
    // {
    //   key: '3',
    //   nom_traitement: 'Détartrage',
    //   prix: 80,
    //   duration_estimation: '45 min',
    //   visite_type: 'Première visite',
    // },
    // {
    //   key: '4',
    //   nom_traitement: 'Extraction dentaire',
    //   prix: 150,
    //   duration_estimation: '1h 30 min',
    //   visite_type: 'Urgence',
    // },
    // {
    //   key: '5',
    //   nom_traitement: 'Couronne dentaire',
    //   prix: 500,
    //   duration_estimation: '2h',
    //   visite_type: 'Visite de suivi',
    // }
];
  


function Peripherals() {
    const navigate = useNavigate();
    //const {data , dataCopy , setDataCopy , isLoading , onRefresh} = useFetch(endpoints.patients.LIST)
    const {getColumnSearchProps} = useSearch()
    const patientsList = data;
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);


    //console.log(data)


    const onAdd = () => {
        setCurrentRecord(null);
        navigate('/espace-dentist/peripherals/new-peripheral' , { state : { record : null}})
        //setOperationType("add");
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
                        //onRefresh()
                    }
                })
            }
        })
    }

    const viewDetails = (record) => {
        navigate("/espace-dentist/patients/details?tab=2",{state : {currentPatient : record} , replace : false});
        sessionStorage.setItem("currentPatient",JSON.stringify(record))
    }
    
    const onExport = () => {
        setOperationType("exp");
        setOpen(true);
    }

    const onDisplayAdvancedSearch = () => {
        setOperationType("ads");
        setOpen(true);
    }

    useEffect(()=>{
      
    },[])
    
    return (
        <Card>
            <Title level={3} >Liste des périphériques</Title>

            <Flex justify="space-between" align="center" >

                <Space>
                    <SearchBar 
                        data={data}
                        //setDataCopy={setDataCopy}
                        listKeys={['nom_traitement','prix']}
                    />
                    {/* <AdvancedSearchButton onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp; */}
                </Space>
                <Space>
                    <ReloadButton onRefresh={/*onRefresh*/null} /> &nbsp;&nbsp;
                    {/* <Tooltip title="Recherche avancée" >
                        <Button type='text' shape="circle" icon={<IoFilter size={20}/>} onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                    </Tooltip>  */}
                    {/* <AdvancedSearchButton onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp; */}
                    {/* <Tooltip title="Exporter" >
                        <Button type='text' shape="circle" icon={<ExportOutlined/>} onClick={onExport} /> &nbsp;&nbsp;
                    </Tooltip>  */}
                    {/* <ExcellExportButton onClick={onExport} /> &nbsp;&nbsp; */}
                    {/* {
                        //tableLoading === false &&
                        dataSourceCopy.length !== 0 &&
                        <>
                            <ExportFile title={title} data={dataSourceCopy} /> &nbsp;&nbsp;
                        </>
                    } */}
                    {/* <Tooltip title="Actualiser" >
                        <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} /> &nbsp;&nbsp;
                    </Tooltip>  */}
                    
                    <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
                </Space>
            </Flex>

            <br/>

            <DataTable 
                dataSource={data}
                dataSourceCopy={dataCopy}
                //setDataSourceCopy={setDataCopy}
                //tableLoading={isLoading}
                rowKey={(record)=>record.nom_traitement}
                //rowSelected
                columns={[
                    {
                        title: 'Nom du produit',
                        dataIndex: 'nom_produit',
                        key: 'nom_produit',
                        ...getColumnSearchProps('nom_produit')
                    },
                    {
                        title: 'Prix',
                        dataIndex: 'prix',
                        key: 'prix',
                        sorter: (a, b) => a.prix - b.prix,
                        ...getColumnSearchProps('prix')
                    },
                    {
                        title: 'Catégorie',
                        dataIndex: 'categorie',
                        key: 'categorie'
                    },
                    {
                        render :  (record)=>(
                            <Flex align='center' >
                                <Dropdown
                                    menu={{items :  
                                        [
                                            {
                                                label: "Voir détails" ,
                                                key: '0',
                                                onClick : ()=>{viewDetails(record)},
                                            },
                                            {
                                                label: "Modifier",
                                                key: '1',
                                                onClick : ()=>{onEdit(record)} , 
                                            }, 
                                            {
                                                label: "Supprimer" ,
                                                key: '2',
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
                title={operationType === "add" ? "Nouveau traitement" : "Mettre à jour les données"} 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <AddTreatment 
                    setOpen={setOpen}
                    operationType={operationType}
                    //onRefresh={onRefresh}
                    currentRecord={currentRecord}
                />
            </Modal>

        </Card>
    )
}

export default Peripherals