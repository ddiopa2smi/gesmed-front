import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Collapse, Descriptions, Dropdown, Flex, Row, Space, Table, Tabs, Tooltip, Typography, message } from 'antd';
import { useLocation, useNavigate } from 'react-router';
import { DeleteOutlined, EditOutlined, PrinterOutlined, ReloadOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { deleteActions, getActions } from '../../actions/actions';
import { codesPrescriptions } from '../../constants/app.constants';
import DataTable from '../../components/common/DataTable/DataTable';
import { deletePopup, formatDate, printPDF } from '../../utils/helpers';
import { Link } from 'react-router-dom';
import useObjectFetch from '../../utils/hooks/useObjectFetch';
import { endpoints } from '../../constants/endpoints.constants';
import NotSpecified from '../../components/common/NotSpecified/NotSpecified';
import useSearch from '../../utils/hooks/useSearch';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import BackButton from '../../components/common/BackButton/BackButton';
import EditButton from '../../components/common/EditButton/EditButton';
import PrintButton from '../../components/common/PrintButton/PrintButton';
import DeleteButton from '../../components/common/DeleteButton/DeleteButton';
import MoreButton from '../../components/common/MoreButton/MoreButton';

const {Title} = Typography;



function DossierMedical() {
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));  
    const {state} = useLocation();
    //const currentPatient = state?.currentPatient;
    const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));
    const navigate = useNavigate();
    // const currentObject  = JSON.parse(sessionStorage.getItem("currentObject"));
    const {getColumnSearchProps} = useSearch();

    //const getDossierPatient = useObjectFetch(`${endpoints.dossierMedical.DOSSIER}?numpat=${currentPatient.num_patient}`);
    const {data , isLoading , onRefresh : refreshConsultation ,error } = useObjectFetch(`${endpoints.dossierMedical.DOSSIER}?numpat=${currentPatient.num_patient}`);
    const patient = data?.patient;
    const listConsultation = data?.listConsultation;
    const listPrescription = data?.listPrescription;

    const doConsultation = (numRV) => {

        navigate("/myspace/patients/dossier/consultation" , {state : {numRV : numRV , currentPatient : currentPatient}});
        
        // getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`)
        // .then((response)=>{
        //     if (response && response.data) {
        //         //sessionStorage.setItem("initConsultation", JSON.stringify(response.data));

        //         navigate("/myspace/patients/dossier/consultation" , {state : {consultationObject : response.data , currentPatient : currentPatient}});
        //     }
        // })
    }

    const onEditConsultation = (record) => {
        doConsultation(record.numrv)
    }
    
    const onDeleteConsultation = (record) => {

    }

    const onEditPrescription = (record , prescriptionType) => {
        navigate(`/myspace/patients/dossier/prescriptions/${prescriptionType}`);
        sessionStorage.setItem("editPrescription", JSON.stringify(record));
    }
    const onDeletePrescription = (record) => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                deleteActions(`${endpoints.prescriptions.DELETE}/${record?.numpresc}`)
                .then((response)=>{
                    if (response.data.Deleted === true) {
                        message.success("Ligne retirée avec succès");
                        refreshConsultation()
                    }
                })
            }
        })
    }

    const handlePrescriptions = (codepres , item) => {
        navigate("/myspace/patients/dossier/prescriptions",{replace : false});
        sessionStorage.setItem("currentPatient", JSON.stringify(currentPatient));
        console.log(item)
        sessionStorage.setItem("prescription",JSON.stringify({  
            codepresc : codepres,
            numcons : item.numcons ,
            medecin : item.medecin
        }));
    }

    const collapseItems = [
        {
            key : "1",
            label : "Voir les infos patient",
            children : <div>
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
                        { patient?.datenaiss_patient && formatDate(patient?.datenaiss_patient) || <NotSpecified/>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Age">
                        { `${patient?.age_patient} an(s)` || <NotSpecified/>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Groupe sanguin">
                        { patient?.group_sanguin || <NotSpecified/>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Téléphone">
                        { patient?.tel_patient || <NotSpecified/>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email">
                        { patient?.email_patient || <NotSpecified/>}
                    </Descriptions.Item>
                </Descriptions>
            </div>
            // <Row gutter={[24,24]} >
            //     <Col xs={24} sm={24} md={12} lg={12} xl={12}> 
            //         <Card
            //             title="Infos Patient"
            //             headStyle={{background:"var(--app-color)",color:"#fff"}}
            //             loading={isLoading}
            //             size="small"
            //         >
            //             <Descriptions column={2} layout="horizontal"  /*layout={window.screen.height < 992 && 'vertical'}*/ >
            //                 <Descriptions.Item label="Nom"> 
            //                     { patient?.nom_patient || <NotSpecified/>} 
            //                 </Descriptions.Item>
            //                 <Descriptions.Item label="Prénom">
            //                     { patient?.prenom_patient || <NotSpecified/>}
            //                 </Descriptions.Item>
            //                 <Descriptions.Item label="Sexe">
            //                     { patient?.sexe_patient  || <NotSpecified/>}
            //                 </Descriptions.Item>
            //                 <Descriptions.Item label="Date de naissance">
            //                     { patient?.datenaiss_patient && formatDate(patient?.datenaiss_patient) || <NotSpecified/>}
            //                 </Descriptions.Item>
            //                 <Descriptions.Item label="Age">
            //                     { `${patient?.age_patient} an(s)` || <NotSpecified/>}
            //                 </Descriptions.Item>
            //                 <Descriptions.Item label="Groupe sanguin">
            //                     { patient?.group_sanguin || <NotSpecified/>}
            //                 </Descriptions.Item>
            //             </Descriptions>
            //         </Card>
            //     </Col>
            //     <Col xs={24} sm={24} md={12} lg={12} xl={12}> 
            //         <Card
            //             title="Observations particulières"
            //             headStyle={{background:"var(--app-color)",color:"#fff"}}
            //             loading={isLoading}
            //             size="small"
            //         >
            //             {
            //                 patient?.obs_part ? patient.obs_part : "Pas d'observations"
            //             }
            //         </Card>
            //     </Col>
            // </Row> 
        },
        {
            key : "2",
            label : "Observations particulières",
            children : <div>
                {
                    patient?.obs_part ? patient.obs_part : "Pas d'observations"
                }
            </div>
        }
    ]
    
    return (
        data === null ?
        <Card loading /> 
        :
        <Card bordered={false} loading={isLoading} >
            <Flex justify='flex-start' align='center' >
                <BackButton />
            </Flex>
            <br/>
            <Row gutter={[24,24]}>
                <Col sxs={24} sm={24} md={12} lg={12} xl={12} >
                    <Title level={4}>Dossier Médical Patient N°{currentPatient.num_patient} / {currentPatient.prenom_patient} {currentPatient.nom_patient} </Title>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12} offset={0}>
                    <Flex justify="flex-end" align="center" wrap="nowrap" >
                        <Space>
                            {/* <Button type="link"  onClick={()=>{onRefresh()}} >Actualiser</Button>  */}
                            <ReloadButton onRefresh={refreshConsultation} /> 
                            <Button type="primary"  onClick={()=>{/*getConsultationData(listConsultation[0].numrv) */ doConsultation(listConsultation[0].numrv) }} disabled={listConsultation.length === 0 ? true : false} >Consultation</Button> 
                            <Button type='primary' ghost onClick={()=>{navigate("/myspace/patients/dossier/infos-cliniques") /*message.info("En cours de développement") */ }} >Infos cliniques</Button>  
                        </Space>
                    </Flex> 
                </Col>
            </Row>
            <br/>

            <Collapse items={collapseItems} defaultActiveKey={['1']}  />

            
            <br/>
            <Tabs 
                defaultActiveKey={"1"} 
                items={[
                    {
                        key : "1",
                        label : "Consultations",
                        children : <React.Fragment>
                            <Title level={4} > Liste des consultations de {currentPatient.prenom_patient} {currentPatient.nom_patient}  </Title>
                            <br/>
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
                                        ...getColumnSearchProps("datecons"),
                                        render: (record) => <div className='table-data'>
                                            {formatDate(record)}
                                        </div>
                                    },
                                    {
                                        title: 'Médécin',
                                        dataIndex: 'medecin',
                                        key: 'medecin',
                                        ...getColumnSearchProps("medecin"),
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
                                            <Flex justify='flex-start' align="center" >
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
                                                                    <Button type='text' icon={<UnorderedListOutlined  />} />
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
                                                                {/* <Tooltip title="Imprimer" >
                                                                    <Button type='text' icon={<PrinterOutlined/> }/>
                                                                </Tooltip> */}
                                                                <div>
                                                                <PrintButton />
                                                                </div>
                                                                
                                                            </Dropdown> 
                                                        </>
                                                    }
                                
                                                    {
                                                        record.medecin === userConnected.username &&
                                                        <EditButton onEdit={()=>{onEditConsultation(record)}} />
                                                        // <Tooltip title="Editer">
                                                        //     <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEditConsultation(record)}} />
                                                        // </Tooltip>
                                                    }
                                
                                                    {
                                                        record.medecin === userConnected.username &&
                                                        <DeleteButton onDelete={()=>{onDeleteConsultation(record)}} />
                                                    }
                                                </Space>
                                            </Flex>
                                        )
                                    }
                                ]}
                            />
                        </React.Fragment>
                    },
                    {
                        key : "2",
                        label : "Ordonnances",
                        children : <React.Fragment>
                            <Title level={4} > Liste des ordonnances de {currentPatient.prenom_patient} {currentPatient.nom_patient}  </Title>
                            <br/>
                            <DataTable 
                                dataSourceCopy={
                                    listPrescription.filter(element => element.codepresc === codesPrescriptions.ORD ) || []
                                }
                                tableLoading={isLoading}
                                rowKey={(record)=>record.numpresc}
                                columns={[
                                    {
                                        title: 'N° ord.',
                                        dataIndex: 'numpresc',
                                        key: 'numpresc',
                                    },
                                    {
                                        title: 'Date presc',
                                        dataIndex: 'datepresc',
                                        key: 'datepresc',
                                        // ...getColumnSearchProps("datepresc"),
                                        render: (record) => <div className='table-data'>
                                            {formatDate(record)}
                                        </div>
                                    },
                                    {
                                        title: 'Prescripteur',
                                        dataIndex: 'prescripteur',
                                        key: 'prescripteur',
                                        // ...getColumnSearchProps("medecin"),
                                        sorter: (a, b) => a.medecin?.charCodeAt(0) - b.medecin?.charCodeAt(0) ,
                                        //sortOrder: sortedInfo.columnKey === 'medecin' ? sortedInfo.order : null
                                    },
                                    {
                                        width : 'auto' ,
                                        render :  (record)=>(
                                            <Flex justify="center" align="center" >
                                                <Space>
                                                    {
                                                        record?.medecin !== null && 
                                                        <PrintButton onPrint={()=>{printPDF(`/api/Print/smed/Prescription/${record.numpresc}/ordonnance`)}} />
                                                    }
                                                    <EditButton onEdit={()=>{onEditPrescription(record,"ordonnance")}} />
                                                    <DeleteButton onDelete={()=>{ onDeletePrescription(record) }} />
                                                </Space>
                                            </Flex>
                                        )
                                    }
                                ]}
                            />
                        </React.Fragment>
                    },
                    {
                        key : "3",
                        label : "Analyses",
                        children : <React.Fragment>
                            <Title level={4} > Liste des analyses de {currentPatient.prenom_patient} {currentPatient.nom_patient}  </Title>
                            <br/>
                            <DataTable 
                                dataSourceCopy={
                                    listPrescription.filter(element => element.codepresc === codesPrescriptions.ANA ) || []
                                }
                                tableLoading={isLoading}
                                rowKey={(record)=>record.numpresc}
                                columns={[
                                    {
                                        title: 'N° analyse.',
                                        dataIndex: 'numpresc',
                                        key: 'numpresc',
                                    },
                                    {
                                        title: 'Date presc',
                                        dataIndex: 'datepresc',
                                        key: 'datepresc',
                                        // ...getColumnSearchProps("datepresc"),
                                        render: (record) => <div className='table-data'>
                                            {formatDate(record)}
                                        </div>
                                    },
                                    {
                                        title: 'Prescripteur',
                                        dataIndex: 'prescripteur',
                                        key: 'prescripteur',
                                        // ...getColumnSearchProps("medecin"),
                                        sorter: (a, b) => a.medecin?.charCodeAt(0) - b.medecin?.charCodeAt(0) ,
                                        //sortOrder: sortedInfo.columnKey === 'medecin' ? sortedInfo.order : null
                                    },
                                    {
                                        width : 'auto' ,
                                        render :  (record)=>(
                                            <Flex justify="center" align="center" >
                                                <Space>
                                                    {
                                                        record?.medecin !== null && 
                                                        <PrintButton onPrint={()=>{printPDF(`/api/Print/smed/Prescription/${record.numpresc}/analyse`)}} />
                                                    }
                                                    <EditButton onEdit={()=>{onEditPrescription(record,"analyse")}} />
                                                    <DeleteButton onDelete={()=>{ onDeletePrescription(record) }} />
                                                </Space>
                                            </Flex>
                                        )
                                    }
                                ]}
                            />
                        </React.Fragment>
                    },
                    {
                        key : "4",
                        label : "Imageries",
                        children : <React.Fragment>
                            <Title level={4} > Liste des imageries de {currentPatient.prenom_patient} {currentPatient.nom_patient}  </Title>
                            <br/>
                            <DataTable 
                                dataSourceCopy={
                                    listPrescription.filter(element => element.codepresc === codesPrescriptions.IMG ) || []
                                }
                                tableLoading={isLoading}
                                rowKey={(record)=>record.numpresc}
                                columns={[
                                    {
                                        title: 'N° img.',
                                        dataIndex: 'numpresc',
                                        key: 'numpresc',
                                    },
                                    {
                                        title: 'Date presc',
                                        dataIndex: 'datepresc',
                                        key: 'datepresc',
                                        // ...getColumnSearchProps("datepresc"),
                                        render: (record) => <div className='table-data'>
                                            {formatDate(record)}
                                        </div>
                                    },
                                    {
                                        title: 'Prescripteur',
                                        dataIndex: 'prescripteur',
                                        key: 'prescripteur',
                                        // ...getColumnSearchProps("medecin"),
                                        sorter: (a, b) => a.medecin?.charCodeAt(0) - b.medecin?.charCodeAt(0) ,
                                        //sortOrder: sortedInfo.columnKey === 'medecin' ? sortedInfo.order : null
                                    },
                                    {
                                        width : 'auto' ,
                                        render :  (record)=>(
                                            <Flex justify="center" align="center" >
                                                <Space>
                                                    {
                                                        record?.medecin !== null && 
                                                        <PrintButton onPrint={()=>{printPDF(`/api/Print/smed/Prescription/${record.numpresc}/imagerie`)}} />
                                                    }
                                                    <EditButton onEdit={()=>{onEditPrescription(record,"imagerie")}} />
                                                    <DeleteButton onDelete={()=>{ onDeletePrescription(record) }} />
                                                </Space>
                                            </Flex>
                                        )
                                    }
                                ]}
                            />
                        </React.Fragment>
                    }
                ]} 
            />
            
        
        </Card>
    )
}

export default DossierMedical