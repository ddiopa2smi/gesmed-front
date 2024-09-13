import {Modal ,Card , Row , Col , Form,  Input , InputNumber , Typography , Select , Button, DatePicker, message, Flex, Divider, Space, Dropdown, Alert } from 'antd'
import React, { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import dayjs from 'dayjs'
import { getActions, putActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import AddAndEditDropdown from '../../components/common/AddAndEditDropdown/AddAndEditDropdown';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import useFetch from '../../utils/hooks/useFetch';
import AddPathologie from '../../components/specific/AddPathologie/AddPathologie';
import AddMotif from '../../components/specific/AddMotif/AddMotif';
import AddRegion from '../../components/specific/AddRegion/AddRegion';
import { ArrowLeftOutlined } from '@ant-design/icons';
import BackButton from '../../components/common/BackButton/BackButton';
import ReloadButton from '../../components/common/ReloadButton/ReloadButton';
import { deletePopup, printPDF } from '../../utils/helpers';
import { codesPrescriptions } from '../../constants/app.constants';
import useObjectFetch from '../../utils/hooks/useObjectFetch';
const {Title , Text} = Typography;
const { TextArea } = Input;
const {Option} = Select;


const getInitCons = (initCons) => {
    initCons.datecons = dayjs(initCons?.datecons);
    initCons.date_rv = initCons?.date_rv === null ? dayjs(new Date())  : dayjs(initCons.date_rv);
    initCons.debut_rm = initCons?.debut_rm === null ? dayjs(new Date())  : dayjs(initCons.debut_rm);
    initCons.fin_rm = initCons?.fin_rm === null ? dayjs(new Date())  : dayjs(initCons.fin_rm);
    return initCons;
}

function Consultation() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const {state} = useLocation();
    // const currentPatient = state?.currentPatient;
    // const consultationObject = state?.consultationObject;
    
    // const initCons = getInitCons(consultationObject);
    // const [initConsultation , setInitConsultation] = useState(initCons);


    const currentPatient = state?.currentPatient;
    const numRV = state?.numRV;

    //const {data : consultationData , onRefresh : refreshConsultation , isLoading : consultationDataLoading} = useObjectFetch(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`);
    //const initCons = consultationData !== null ? getInitCons(consultationData) : null;
    const [initConsultation , setInitConsultation] = useState(null);
    const [consultationDataLoading , setConsultationDataLoading] = useState(false)
    const [refetch , setRefetch] = useState(null)


    const [isImcAlertVisible , setIsImcAlertVisible] = useState(false);
    const [imcAlert , setImcAlert] = useState("");

    const refreshConsultation = () => {
        setRefetch(Date.now())
    }
    useEffect(() => {
        setConsultationDataLoading(true)
        getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${numRV}`)
        .then((response)=>{
            if (response?.data) {
                setInitConsultation(getInitCons(response?.data))
                form.setFieldsValue(getInitCons(response?.data))
            }
        })
        .finally(()=>{
            setConsultationDataLoading(false)
        })
    }, [refetch])
    

    const [pathologieSelected  , setPathologieSelected] = useState(null);
    const [motifSelected  , setMotifSelected] = useState(null);
    const [regionSelected  , setRegionSelected] = useState(null);
    
    const [open , setOpen] = useState(false);
    const [currentSelectableTask , setCurrentSelectableTask] = useState("");
    const [operationType , setOperationType] = useState(null);
    const [loading , setLoading] = useState(false);

    const { data : pathologies , isLoading : pathologiesLoading , onRefresh : pathologiesRefreshList} = useFetch(endpoints.pathologie.LIST);
    const {data : motifs , isLoading : motifsLoading , onRefresh : motifsRefreshList} = useFetch(endpoints.motifs.LIST);
    const { data : regions , isLoading : regionsLoading , onRefresh : regionsRefreshList} = useFetch(endpoints.regions.LIST);
     

    const itemsMotif = [
        {
            key: '0',
            label: (<span onClick={()=>{openModal("add","MOTIF")}} >Ajouter</span>) ,
        },
        {
            label: <span onClick={()=>{openModal("update","MOTIF")}} >Modifier</span>,
            key: '1',
            disabled : motifSelected === null ? true : false
        },
    ];

    const itemsPathologie = [
        {
            label: <span onClick={()=>{openModal("add","PATHOLOGIE")}} >Ajouter</span> ,
            key: '0',
        },
        {
            label: <span onClick={()=>{openModal("update","PATHOLOGIE")}} >Modifier</span>,
            key: '1',
            disabled : pathologieSelected === null ? true : false
        },
    ];

    const itemsRegion = [
        {
            label: <span onClick={()=>{openModal("add","REGION")}} >Ajouter</span> ,
            key: '0',
        },
        {
            label: <span onClick={()=>{openModal("update","REGION")}} >Modifier</span>,
            key: '1',
            disabled : regionSelected === null ? true : false
        },
    ];

    const openModal = (operation , selectableTask) => {
        setOpen(true);
        setOperationType(operation);
        setCurrentSelectableTask(selectableTask);
    }


    const save = () => {
        setLoading(true);
        form
        .validateFields()
        .then((values)=>{
            values.datecons = new Date(values.datecons).toISOString();
            values.date_rv = new Date(values.date_rv).toISOString() ;
            values.debut_rm = new Date(values.debut_rm).toISOString() ;
            values.fin_rm = new Date(values.fin_rm).toISOString() ;
            const payload = {...initConsultation , ...values};
            putActions(endpoints.consultations.UPDATE , payload)
            .then((response)=>{
                //console.log(response.data);
                if (response?.data?.Updated) {
                    message.success("Consultation enrégistreé avec succès");
                    refreshConsultation()
                    // getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${payload.numrv}`)
                    // .then((response)=>{
                    //     const data = getInitCons(response.data);
                    //     setInitConsultation(data);
                    //     form.setFieldsValue(data);
                    //     //sessionStorage.setItem("initConsultation", JSON.stringify(response.data));
                    //     setLoading(false);
                    //     message.success("Consultation enrégistreé avec succès");
                    //     form.resetFields();
                    //     //navigate(-1);
                    // })
                }
                else {
                    setLoading(false);
                    message.error("Oopss...,quelque chose s'est mal passé, veuillez réessayer");
                }
            }) 
            .finally(()=>{
                setLoading(false)
            })
        })
        .catch((info)=>{
            console.log('Validate Failed:', info);
        })
    }

    const validFinalConsultation = () => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                console.log("final consult")
            }
        })
    }


    const imcAlertMessage = (imc) => {
        let result = "";
        if (imc<18.5) {
            result+="Insuffisance pondérale (maigreur)";
        }
        else if (imc>= 18.5 && imc< 25) {
            result+="Corpulence normale";
        }
        else if (imc>= 25 && imc< 30) {
            setIsImcAlertVisible(true);
            result+="Surpoids";
        }
        else if (imc>= 30 && imc< 35) {
            result+="Obésité modérée";
        }
        else if (imc>= 35 && imc< 40) {
            result+="Obésité sévère";
        }
        else if (imc >= 40) {
            result+="Obésité morbide ou massive";
        } 

        return result;
    }

    
    
    
   //console.log(initConsultation)

    return (
        <Card loading={consultationDataLoading} >
            <Flex justify='flex-start' align='center' >
                <BackButton /> &nbsp;&nbsp;
                <Button type='primary' size='small' onClick={()=>{validFinalConsultation()}} disabled={initConsultation?.medecin === null} >Cloturer la consultation</Button>
            </Flex>
            <br/>
            <br/>
            <Flex justify='space-between' align='center' >
                <Title level={4} >Consultation médical {initConsultation?.numcons}  </Title>
                <Space align="center" >
                    <ReloadButton 
                        onRefresh={refreshConsultation}
                    />
                    
                    <Dropdown
                        disabled={initConsultation?.medecin !== null ? false : true}
                        menu={{
                            items : [
                                {
                                    key: '1',
                                    label: (
                                        <span onClick={()=>{printPDF(`/api/Print/smed/Consultation/${initConsultation.numcons}/certificat`)}} >
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
                        <Button 
                            type="primary"
                        >
                            Imprimer
                        </Button>
                    </Dropdown> 
                    
                    <Dropdown
                        disabled={initConsultation?.medecin !== null ? false : true}
                        menu={{items : [
                            {
                                label: <span> Ordonnance </span> ,
                                key: '0',
                                onClick : ()=>{
                                    // nettoyer la prescription en mémoire
                                    sessionStorage.removeItem("editPrescription");
                                    sessionStorage.setItem("prescription",JSON.stringify({  
                                        codepresc : codesPrescriptions.ORD,
                                        numcons : initConsultation.numcons ,
                                        medecin : initConsultation.medecin
                                    }));
                                    navigate(`/myspace/patients/dossier/prescriptions/ordonnance`);
                                }
                            },
                            {
                                label: <span> Analyse </span> ,
                                key: '1',
                                onClick : ()=>{
                                    sessionStorage.removeItem("editPrescription");
                                    sessionStorage.setItem("prescription",JSON.stringify({  
                                        codepresc : codesPrescriptions.ANA,
                                        numcons : initConsultation.numcons ,
                                        medecin : initConsultation.medecin
                                    }));
                                    navigate(`/myspace/patients/dossier/prescriptions/analyse`);
                                }
                            },
                            {
                                label: <span> Imagerie </span>,
                                key: '2',
                                onClick : ()=>{
                                    sessionStorage.removeItem("editPrescription");
                                    sessionStorage.setItem("prescription",JSON.stringify({  
                                        codepresc : codesPrescriptions.IMG,
                                        numcons : initConsultation.numcons ,
                                        medecin : initConsultation.medecin
                                    }));
                                    navigate(`/myspace/patients/dossier/prescriptions/imagerie`);
                                }
                            }, 
                        ]}}
                        trigger={['click']}
                    >
                        <Button 
                            type="primary"
                        >
                            Prescrire
                        </Button>
                    </Dropdown>
                </Space>
            </Flex>
           

            <Text level={4} > Patient : {currentPatient.num_patient} / {currentPatient.prenom_patient} {currentPatient.nom_patient} </Text>

            <Form
                layout='vertical'
                form={form}
                name="consultation_form"
                initialValues={initConsultation}
                
                onValuesChange={(changedValues , allValues)=>{

                    if (changedValues.code_patho) {
                        const code_p = changedValues.code_patho;
                        pathologies.forEach(element => {
                            if (element.code_patho === code_p) {
                                setPathologieSelected(element);
                            }
                        });
                    }

                    if (changedValues.code_motifcons) {
                        const code_m = changedValues.code_motifcons;
                        motifs.forEach(element => {
                            if (element.code_motifcons === code_m) {
                                setMotifSelected(element);
                            }
                        });
                        form.setFieldValue("motif_ref",changedValues.code_motifcons)
                    }

                    if (changedValues.code_region) {
                        const code_r = changedValues.code_region;
                        regions.forEach(element => {
                            if (element.code_region === code_r) {
                                setRegionSelected(element);
                            }
                        });
                    }
                    
                    if (changedValues.nb_jours_rv) {
                        const newValue = new Date().setDate(new Date(allValues.datecons).getDate() + changedValues.nb_jours_rv);
                        allValues.date_rv = newValue;
                        form.setFieldValue("date_rv",dayjs(newValue));
                    }

                    if (changedValues.nb_jours_rm) {
                        const newValue = new Date().setDate(new Date(allValues.debut_rm).getDate() + changedValues.nb_jours_rm);
                        allValues.fin_rm = newValue;
                        form.setFieldValue("fin_rm",dayjs(newValue));
                    }

                }}

                onFinish={save}
            >
                <Divider/>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Pathologie"
                                name="code_patho" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Pathologie"
                                    optionFilterProp="children" 
                                    loading={pathologiesLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                    {
                                        pathologies.map((item , key)=>(
                                            <Option key={key}  value={item.code_patho} > {item.libelle_patho} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={itemsPathologie} />
                        </Flex>        
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Motif de consultation"
                                name="code_motifcons" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    showSearch
                                    placeholder="Motif de consultation"
                                    optionFilterProp="children" 
                                    loading={motifsLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                        {
                                            motifs.map((item , key)=>(
                                                <Option key={key}  value={item.code_motifcons} > {item.libelle_motifcons} </Option>
                                            ))
                                        }
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={itemsMotif} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Région concernée"
                                name="code_region" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Région concernée"
                                    optionFilterProp="children" 
                                    loading={regionsLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                    {
                                        regions.map((item , key)=>(
                                            <Option key={key}  value={item.code_region} > {item.libelle_region} </Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={itemsRegion} />
                        </Flex>
                    </Col>
                </Row>

                <Divider> Séance </Divider>

                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Résultat interrogation"
                            name="resultat" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Examen physique"
                            name="examen" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Diagnostic"
                            name="diagnostic" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
                <Divider> Examen clinique </Divider>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="TA"
                            name="tension" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Température(°C)"
                            name="temp" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Pouls"
                            name="pouls" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Poids(kg)"
                            name="poids" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Taille(cm)"
                            name="taille" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber min={0}/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label={<Text strong >IMC (kg/m<sup>3</sup>) </Text>}
                            name="imc" 
                        >
                            <InputNumber min={0} disabled />
                        </Form.Item>
                        <Alert message={imcAlertMessage(form.getFieldValue("imc"))} />
                    </Col>
                </Row>

                <br/>

                <Divider>Rendez-vous médical</Divider>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            name="nb_jours_rv" 
                            label="Nbre de jours"
                        >
                            <InputNumber min={0}  />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Date cons"
                            name="datecons" 
                        >
                            <DatePicker disabled format="dddd, DD MMMM YYYY" />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            name="date_rv" 
                            label="Date RV"
                        >
                            <DatePicker disabled format="dddd, DD MMMM YYYY" />
                        </Form.Item>
                    </Col>                              
                </Row>

                <Divider>Repos médical</Divider>
                
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            name="nb_jours_rm" 
                            label="Nbre de jours"
                        >
                            <InputNumber min={0} />
                        </Form.Item>
                        
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            name="debut_rm" 
                            label="Date début repos"
                        >
                            <DatePicker style={{color:"green"}} disabled placeholder='Début' format="dddd, DD MMMM YYYY" />
                        </Form.Item>
                        
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            name="fin_rm" 
                            label="Date fin repos"
                        >
                            <DatePicker disabled placeholder='Fin' format="dddd, DD MMMM YYYY" />
                        </Form.Item>
                        
                    </Col>
                </Row>
                
                <Divider>Référencement</Divider>
                
                <Row gutter={[24,24]}>
                    
                    <Col xs={24} sm={12} md={6} lg={6} xl={6} >
                        <Form.Item 
                            name="date_ref" 
                            label="Date "
                        >
                            <DatePicker style={{color:"green"}} placeholder='Début' format="dddd, DD MMMM YYYY" />
                        </Form.Item>
                        
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} xl={6} >
                        <Form.Item 
                            name="structure_ref" 
                            label="Structure médicale"
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} xl={6} >
                        <Form.Item 
                            name="motif_ref" 
                            label="Motif"
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={6} lg={6} xl={6} >
                        <Form.Item 
                            name="moyen_transport_ref" 
                            label="Moyen de transport"
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Pathologie"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                               <Option key={"1"}  value={"ambulance"} > Ambulance </Option>
                               <Option key={"2"}  value={"personnel"} > Personnel </Option>
                            </Select>
                        </Form.Item>
                        
                    </Col>
                </Row>
                <br/>

                <FormFooter 
                    onCancel={()=>{navigate(-1)}}
                    loading={loading}
                    htmlType={"submit"}
                />

            </Form>

            <Modal
                title={currentSelectableTask === "PATHOLOGIE" && "Pathologie" || currentSelectableTask === "MOTIF" && "Motif" || currentSelectableTask === "REGION" && "Région" }
                open={open}
                //width={700}
                onCancel={()=>{
                    setOpen(false);
                    setPathologieSelected(null);
                    setMotifSelected(null);
                    setRegionSelected(null);
                }}
                footer={null}
                destroyOnClose
            >
                {currentSelectableTask === "PATHOLOGIE" && <AddPathologie  setOpen={setOpen} operationType={operationType} onRefresh={pathologiesRefreshList} currentRecord={pathologieSelected} /> }

                {currentSelectableTask === "MOTIF" && <AddMotif  setOpen={setOpen} operationType={operationType} onRefresh={motifsRefreshList} currentRecord={motifSelected} /> }

                {currentSelectableTask === "REGION" && <AddRegion  setOpen={setOpen} operationType={operationType} onRefresh={regionsRefreshList} currentRecord={regionSelected} />}
                
            </Modal>
            
            
        </Card>
        
    )
}


export default Consultation