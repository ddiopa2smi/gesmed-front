import React, { useState } from 'react'
import { Button, Card, Col, Descriptions, Dropdown, Flex, Row, Space, Table, Tabs, Tooltip, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { DeleteOutlined, EditOutlined, PrinterOutlined, ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { getActions } from '../../actions/actions';
import { codesPrescriptions } from '../../constants/app.constants';
import DataTable from '../../components/common/DataTable/DataTable';
import { formatDate, printPDF } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import useObjectFetch from '../../utils/hooks/useObjectFetch';
import { endpoints } from '../../constants/endpoints.constants';
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';

const {Title} = Typography;



function DossierMedical() {
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const {state} = useLocation();
    //const currentPatient = state?.currentPatient;
    const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
    const navigate = useNavigate();
    const [loading , setLoading] = useState(true);
    // const currentObject  = JSON.parse(sessionStorage.getItem("currentObject"));

    const getDossierPatient = useObjectFetch(`${endpoints.dossierMedical.DOSSIER}?numpat=${currentPatient.num_patient}`);
    const {data , isLoading , onRefresh ,error } = useObjectFetch(`${endpoints.dossierMedical.DOSSIER}?numpat=${currentPatient.num_patient}`);
    const patient = data?.patient;
    const listConsultation = data?.listConsultation;
    const listPrescription = data?.listPrescription;

    // const [patient , setPatient] = useState(null);
    // const [listConsultation , setListConsultation] = useState([]);
    // const [listPrescription , setListPrescription] = useState([]);


    // const getPatientDossier = () => {
    //     setLoading(true);
    //     getActions(`${endpoints.dossierMedical.dossier}?numpat=${currentPatient.num_patient}`)
    //     .then((response)=>{
    //         //console.log(response.data);
    //         if (response && response.data) {
    //         setPatient(response.data.patient);
    //         //console.log(response.data.patient)
    //         setListConsultation(response.data.listConsultation);
    //         setListPrescription(response.data.listPrescription);
    //         //sessionStorage.setItem("listPrescription",JSON.stringify(response.data.listPrescription));
    //         }

    //         setTimeout(() => {
    //         setLoading(false);
    //         }, 200);
    //     })
    // }
    const items = [
        // {
        //     key: '1',
        //     label: "Consultation(s)",
        //     children:  <SimpleTable
        //         data={listConsultation}
        //         tableType="patientConsultations"
        //         loading={loading}
        //         refresh={getPatientDossier}
        //         currentPatient={currentPatient}
        //     /> ,
        // },
        // {
        //     key: '2',
        //     label: "Ordonnances",
        //     children:  <SimpleTable
        //         data={
        //           listPrescription.filter(element => {
        //               return element.codepresc === prescriptionsCode.ordonnance
        //           }) || []
        //         }
        //         tableType="patientOrdonnances"
        //         loading={loading}
        //         refresh={getPatientDossier}
        //     />,
        // },
        // {
        //     key: '3',
        //     label: "Analyses",
        //     children: <SimpleTable
        //         data={
        //           listPrescription.filter(element => {
        //             return element.codepresc === prescriptionsCode.analyse
        //           }) || []
        //         }
        //         tableType="patientAnalyses"
        //         loading={loading}
        //         refresh={getPatientDossier}
        //     />,
        // },
        // {
        //     key: '4',
        //     label: "Imageries",
        //     children:  <SimpleTable
        //         data={
        //           listPrescription.filter(element => {
        //             return element.codepresc === prescriptionsCode.imagerie
        //           }) || []
        //         }
        //         tableType="patientImageries"
        //         loading={loading}
        //         refresh={getPatientDossier}
        //     />,
        // },
    ];


    const doConsultation = (numRV) => {
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`)
        .then((response)=>{
            if (response && response.data) {
                //sessionStorage.setItem("initConsultation", JSON.stringify(response.data));

                navigate("/myspace/patients/dossier/consultation" , {state : {consultationObject : response.data , currentPatient : currentPatient}});
            }
        })
    }

    const onEdit = (record) => {
        doConsultation(record.numrv)
    }
    const onDelete = (record) => {

    }
    // const handlePrescriptionInStorage = (value) => {
    //     switch (value) {
    //       case '2':
    //           console.log("Nice")
    //         break;
    //       case '3':
            
    //         break;
    //       case '4':
            
    //         break;
    //       default:
    //         break;
    //     }
    // }

    const handlePrescriptions = (codepres , item) => {
        navigate("/myspace/patients/dossier/prescriptions",{replace : false});
        sessionStorage.setItem("currentPatient", JSON.stringify(currentPatient));
        sessionStorage.setItem("prescription",JSON.stringify({  
            codepresc : codepres,
            numcons : item.numcons ,
            medecin : item.medecin
        }));
        //sessionStorage.setItem("initConsultation", JSON.stringify(item));
    }

    
    return (
        data &&
        <Card bordered={false} >
            
            <Row gutter={[24,24]}>
                <Col sxs={24} sm={24} md={12} lg={12} xl={12} >
                    <Title level={5} >Dossier Médical Patient N°{currentPatient.num_patient} / {currentPatient.prenom_patient} {currentPatient.nom_patient} </Title>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} offset={0}>
                    <Flex justify="flex-end" align="center" wrap="nowrap" >
                        <Space>
                            <Button type="link"  onClick={()=>{onRefresh()}} >Actualiser</Button>  
                            <Button type="primary"  onClick={()=>{/*getConsultationData(listConsultation[0].numrv) */ doConsultation(listConsultation[0].numrv) }} disabled={listConsultation.length === 0 ? true : false} >Consultation</Button> 
                            <Button type='ghost' style={{backgroundColor:"lightblue",color:"black"}} onClick={()=>{navigate("/myspace/patients/dossier/infos-cliniques") /*message.info("En cours de développement") */ }} >Infos cliniques</Button>  
                        </Space>
                    </Flex> 
                </Col>
            </Row>
            <br/>

            <Row gutter={[24,24]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}> 
                    <Card
                        title="Infos Patient"
                        headStyle={{background:"var(--app-color)",color:"#fff"}}
                        loading={isLoading}
                        size="small"
                    >
                        <Descriptions column={2} layout="horizontal"  /*layout={window.screen.height < 992 && 'vertical'}*/ >
                            <Descriptions.Item label="Nom"> 
                                { patient?.nom_patient || <NotSpecified/>} 
                            </Descriptions.Item>
                            <Descriptions.Item label="Prénom">
                                { patient?.prenom_patient || <NotSpecified/>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Sexe">
                                { patient?.sexe_patient  || <NotSpecified/>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Date de naissance">
                                { formatDate(patient.datenaiss_patient) || <NotSpecified/>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Age">
                                { `${patient?.age_patient} an(s)` || <NotSpecified/>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Groupe sanguin">
                                { patient?.group_sanguin || <NotSpecified/>}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}> 
                    <Card
                        title="Observations particulières"
                        headStyle={{background:"var(--app-color)",color:"#fff"}}
                        loading={isLoading}
                        size="small"
                    >
                        {
                        patient ? patient.obs_part : "Pas d'observations"
                        }
                    </Card>
                </Col>
            </Row> 
            <br/>
            {/* <Row gutter={[24,24]} >
                <Col span={sizes.col.size1}> 
                <Tabs defaultActiveKey={"1"} items={items} />
                </Col>
            </Row> */}
            <Title level={3} > Liste des consultations </Title>
            <DataTable 
                dataSourceCopy={listConsultation}
                tableLoading={isLoading}
                rowKey={(record)=>record.numcons}
                columns={[
                    {
                        title: 'N° Cons.',
                        dataIndex: 'numcons',
                        key: 'numcons',
                    },
                    {
                        title: 'Date cons',
                        dataIndex: 'datecons',
                        key: 'datecons',
                        render: (record) => <div className='table-data'>
                            {formatDate(record)}
                        </div>
                    },
                    {
                        title: 'Médécin',
                        dataIndex: 'medecin',
                        key: 'medecin',
                        sorter: (a, b) => a.medecin?.charCodeAt(0) - b.medecin?.charCodeAt(0) ,
                        //sortOrder: sortedInfo.columnKey === 'medecin' ? sortedInfo.order : null
                    },
                    {
                        title: 'Tension',
                        dataIndex: 'tension',
                        key: 'tension',
                        sorter: (a, b) => a.tension - b.tension,
                    },
                    {
                        title: 'Temp (°C) ',
                        dataIndex: 'temp',
                        key: 'temp',
                        sorter: (a, b) => a.temp - b.temp,
                    },
                    {
                        title: 'Poids (Kg) ',
                        dataIndex: 'poids',
                        key: 'poids',
                        sorter: (a, b) => a.poids - b.poids
                    },
                    {
                        title: 'Taille (cm) ',
                        dataIndex: 'taille',
                        key: 'taille',
                        sorter: (a, b) => a.taille - b.taille
                    },
                    //Table.EXPAND_COLUMN ,
                    {
                        width : 'auto' ,
                        render :  (record)=>(
                            <Flex justify="center" align="center" >
                                <Space>
                                    {
                                        record?.medecin !== null && 
                                        <>
                                            <Dropdown
                                                menu={{items : [
                                                    {
                                                        label: <span> Ordonnances </span> ,
                                                        key: '0',
                                                        onClick : ()=>{
                                                            handlePrescriptions( codesPrescriptions.ORD ,record);
                                                        }
                                                    },
                                                    {
                                                        label: <span> Analyses </span> ,
                                                        key: '1',
                                                        onClick : ()=>{
                                                            handlePrescriptions( codesPrescriptions.ANA ,record);
                                                        }
                                                    },
                                                    {
                                                        label: <span> Imageries </span>,
                                                        key: '2',
                                                        onClick : ()=>{
                                                            handlePrescriptions( codesPrescriptions.IMG ,record);
                                                        }
                                                    }, 
                                                ]}}
                                                trigger={['click']}
                                            >
                                                <Tooltip title="Prescriptions" >
                                                    <UnorderedListOutlined  />
                                                </Tooltip>
                                            </Dropdown>

                                            <Dropdown
                                                menu={{
                                                    items : [
                                                        {
                                                            key: '1',
                                                            label: (
                                                                <span onClick={()=>{printPDF(`/api/Print/smed/Consultation/${record.numcons}/certificat`)}} >
                                                                Certificat Médical
                                                                </span>
                                                            ),
                                                        },
                                                        {
                                                            key: '2',
                                                            label: (
                                                                <span onClick={()=>{console.log("Bulletin médical")}}>
                                                                Bulletin de visite
                                                                </span>
                                                            ),
                                                            disabled : true
                                                        },
                                                        {
                                                            key: '3',
                                                            label: (
                                                                <span onClick={()=>{console.log("Aptitude")}}>
                                                                Certificat d'aptitude
                                                                </span>
                                                            ),
                                                            disabled : true
                                                        }
                                                    ]
                                                }}
                                                trigger={['click']}
                                            >
                                                <Tooltip title="Imprimer" >
                                                    <Button type='link' icon={<PrinterOutlined/> }/>
                                                </Tooltip>
                                            </Dropdown> 
                                        </>
                                    }
                
                                    {
                                        record.medecin === userConnected.username &&
                                        <Tooltip title="Editer">
                                            <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit(record)}} />
                                        </Tooltip>
                                    }
                
                                    {
                                        record.medecin === userConnected.username &&
                                        <Tooltip title="Supprimer">
                                            <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                                        </Tooltip>
                                    }
                                </Space>
                            </Flex>
                        )
                    }
                ]}
            />
        
        </Card>
    )
}

export default DossierMedical