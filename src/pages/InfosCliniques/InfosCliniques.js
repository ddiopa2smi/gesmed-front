import React, { useEffect, useState } from 'react'
import { Breadcrumb, Button, Card, Col, DatePicker, Dropdown, Form, Input, InputNumber, Modal, Radio, Row, Select, Tabs, Typography, message } from 'antd';
import { useNavigate } from 'react-router';
import { EditOutlined, HomeOutlined, DeleteOutlined, PlusCircleFilled, PlusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { getActions, postActions, putActions } from '../../actions/actions';
import AddPoste from '../../components/specific/AddPoste/AddPoste';
import AddTypeMaladie from '../../components/specific/AddTypeMaladie/AddTypeMaladie';
import AddStructure from '../../components/specific/AddStructure/AddStructure';
import { endpoints } from '../../constants/endpoints.constants';
import DataTable from '../../components/common/DataTable/DataTable';

const {Title , Text} = Typography;
const {Option} = Select;

function InfosCliniques() {
    const navigate = useNavigate();
    const currentObject  = JSON.parse(sessionStorage.getItem("currentPatient"));
    const [initInfosConsultation , setInitInfosConsultation] = useState(null);
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const [suscribe , setSuscribe] = useState(null);

    // Hospitalisation
    const [isAddHospitalisationModalVisible,setIsAddHospitalisationModalVisible] = useState(false);
    const [hospitalisationsData , setHospitalisationsData] = useState([]);
    //Antecedent médical 
    const [isAddAntedecedentMedicalModalVisible , setIsAddAntedecedentMedicalModalVisible] = useState(false);
    const [maladiesData , setMaladiesData] = useState([]);
    // MaladiesProfessionnelles
    const [isAddMaladieProfessionnelleModalVisible , setIsAddMaladieProfessionnelleModalVisible] = useState(false);
    const [maladiesProfData , setMaladiesProfData] = useState([]);
    // Patients Posts
    const [isAddPatientPostModalVisible , setIsAddPatientPostModalVisible ] = useState(false);
    const [patientsPostsData , setPatientsPostsData] = useState([]);

    const TerrainsAddictions= () => {
        const [isTabacAddict , setIsTabacAddict] = useState("Non");
        const [isAlcoolAddict , setIsAlcoolAddict] = useState("Non");
        const [isDrogueAddict , setIsDrogueAddict] = useState("Non");
        return (
            <>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Card>
                            <Card title="Tabac" size='small' >
                                <Row>  
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Addict ?"
                                            name="tabac"
                                        >
                                            <Radio.Group onChange={(e)=>{setIsTabacAddict(e.target.value);}} >
                                                <Radio value="Oui" >Oui</Radio>
                                                <Radio value="Non" >Non</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Durée(an)"
                                            name="duree_tabac"
                                        >
                                            <InputNumber disabled={isTabacAddict === "Non" && true}  />
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Nb de cigarettes / jour"
                                            name="nb_cigarettes"
                                        >
                                            <InputNumber width={300} disabled={isTabacAddict === "Non" && true}  />
                                        </Form.Item>
                                        
                                    </Col>
                                </Row>
                            </Card> <br/>

                            <Card title="Alcool" size='small' >
                                <Row gutter={[24,24]} >  
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Addict ?"
                                            name="alcool"
                                        >
                                            <Radio.Group onChange={(e)=>{setIsAlcoolAddict(e.target.value);}}>
                                                <Radio value="Oui" >Oui</Radio>
                                                <Radio value="Non" >Non</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                            <Form.Item 
                                                label="Durée(an)"
                                                name="duree_alcool"
                                            >
                                                <InputNumber disabled={isAlcoolAddict === "Non" && true} />
                                            </Form.Item>
                                        </Col>
                                        
                                        <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                            <Form.Item 
                                                label="Rythme alcool"
                                                name="rythme_alcool"
                                            >
                                                <Input placeholder='Rythme alcool' disabled={isAlcoolAddict === "Non" && true} />
                                            </Form.Item>
                                            
                                        </Col>
                                </Row>
                            </Card> <br/>
                            <Card title="Drogue" size='small' >
                                <Row gutter={[24,24]} >  
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Addict ?"
                                            name="drogue"
                                        >
                                            <Radio.Group onChange={(e)=>{setIsDrogueAddict(e.target.value);}}>
                                                <Radio value="Oui" >Oui</Radio>
                                                <Radio value="Non" >Non</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>

                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Durée(an)"
                                            name="duree_drogue" 
                                        >
                                            <InputNumber disabled={isDrogueAddict === "Non" && true} />
                                        </Form.Item>
                                    </Col>
                                    
                                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                                        <Form.Item 
                                            label="Type de drogue"
                                            name="type_drogue"
                                        >
                                            <Input placeholder='Type de drogue' disabled={isDrogueAddict === "Non" && true} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Card>
                        </Card>
                    </Col>
                </Row> 
                <br/>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Card >
                            <Row gutter={10}>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Allergies"
                                        name="allergies"
                                    >
                                        <TextArea rows={4} />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Régime en cours"
                                        name="regime"
                                    >
                                        <TextArea rows={4} />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row> 
                <br/>
            </>
        )
    }

    const AddAntecedentMedical = ({patientObject  , maladiesData , setMaladiesData , setIsModalVisible}) => {
        const [maladieform] = Form.useForm();
        const [listMaladies , setListMaladies]= useState([]);

        const onFinish = () => {
            maladieform
            .validateFields()
            .then((values) => {
                let inc = 0; // increment
                let lib_maladie = "";
                for (let i = 0; i < listMaladies.length; i++) {
                    if (listMaladies[i].code_maladie === values.code_maladie) {
                            lib_maladie = listMaladies[i].lib_maladie;
                    } 
                }

                const payload = {
                    numpat : patientObject.num_patient,
                    code_maladie : values.code_maladie ,
                    lib_maladie : lib_maladie,
                    observation : values.observation
                };

                // Tester l'existence de la maladie dans la table des maladies
                for (let i = 0; i < maladiesData.length; i++) {
                    if (maladiesData[i].code_maladie === values.code_maladie ) {
                        inc+=1;
                    }
                }

                
                if (inc === 1) {
                    message.warning('Cette maladie a été déjà ajouté à la table des antécédents médicaux/ maladies')
                    setMaladiesData(maladiesData);
                    
                }else{
                    const temp = maladiesData.push(payload);
                    setMaladiesData([...maladiesData] , temp);
                    maladieform.resetFields();
                    setIsModalVisible(false);
                }   
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
        }
       
        useEffect(()=>{
            getActions(endpoints.maladies.LIST)
            .then((response)=>{
                setListMaladies(response.data)
            })
        },[])
        return (
            <Form
                layout='vertical'
                form={maladieform}
                onFinish={onFinish}
            >
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Form.Item 
                            label="Maladies"
                            name="code_maladie" 
                            initialValue={null}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Maladies"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                {
                                    listMaladies.map((item , key)=>(
                                        <Option key={key}  value={item.code_maladie} > {item.lib_maladie} </Option>
                                    ))
                                }
                                    
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Form.Item 
                            label="Observation"
                            name="observation" 
                            initialValue={null}
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center"}} >
                            <Button type='primary' htmlType='submit' >Valider</Button>
                        </div> 
                    </Col>
                </Row> <br/> 
            </Form>
        )
    }


    const AntecedentsMedicaux = ({data , setData , setIsModalVisible}) => {
        
        return(
            <Card bordered>
                
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}} >
                            <Button type='primary' onClick={()=>{setIsModalVisible(true)}} >Ajouter</Button>
                        </div> 
                    </Col>
                </Row> 
                <br/>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <DataTable 
                            dataSourceCopy={data}
                            setDataSourceCopy={setData}
                            columns={[
                                {
                                    title: 'Code',
                                    dataIndex: 'code_maladie',
                                    key: 'code_maladie'
                                },
                                {
                                    title: 'Maladie',
                                    dataIndex: 'lib_maladie',
                                    key: 'lib_maladie',
                                },
                                {
                                    title: 'Observation',
                                    dataIndex: 'observation',
                                    key: 'observation'
                                },
                                {
                                    width : 'auto' ,
                                    render :  (item)=>(
                                        <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                            <DeleteOutlined 
                                                style={{color:"red"}} 
                                                onClick={()=>{
                                                    const temp = data.filter((element)=>element.code_maladie !== item.code_maladie);
                                                    setData(temp);
                                                }} 
                                            />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
        )
    }


    const AddHospitalisation = ({patientObject  , hospitalisationsData , setHospitalisationsData , setIsModalVisible}) => {
        console.log(hospitalisationsData);
        const [hospitalisationForm] = Form.useForm();
        const [operationType , setOperationType] = useState("");
        const [structures , setStructures]= useState([]);
        const [isModalVisible1 , setIsModalVisible1] = useState(false);
        const [structureSelected , setStructureSelected] = useState(null);
        console.log(hospitalisationsData)

        const onFinish = ()=> {
            hospitalisationForm
            .validateFields()
            .then((values) => {
                let inc = 0; // increment
                const payload = {
                    code_structure : values.code_structure ,
                    date_entree : new Date(values.date_entree).toISOString() ,
                    date_sortie : new Date(values.date_sortie).toISOString() ,
                    motif : values.motif ,
                    numpat : patientObject.num_patient
                }
                

                // // Tester l'existence de la maladie dans la table des maladies
                // for (let i = 0; i < hospitalisationsData.length; i++) {
                //     if (hospitalisationsData[i].code_structure === values.code_structure ) {
                //         inc+=1;
                //     }
                // }

                
                // if (inc === 1) {
                //     message.warning('Cette maladie a été déjà ajouté à la table des antécédetends médicaux/ maladies')
                //     setMaladiesData(maladiesData);
                    
                // }else{
                //     const temp = maladiesData.push(payload);
                //     setMaladiesData([...maladiesData] , temp);
                //     maladieform.resetFields();
                //     setIsModalVisible(false);
                // }  

                const temp = hospitalisationsData.push(payload);
                setHospitalisationsData([...hospitalisationsData] , temp);
                hospitalisationForm.resetFields();
                setIsModalVisible(false);
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
        }

        const handleAdd = () => {
            setIsModalVisible1(true);
            setOperationType("add");
        }
        const handleUpdate = () => {
            setIsModalVisible1(true);
            setOperationType("update"); 
            structures.forEach(element => {
                if (element.code_structure === structureSelected ) { 
                setStructureSelected(element);
                }
            });
        }

        const items = [
            {
                label: <a onClick={handleAdd} >Ajouter</a> ,
                key: '0',
            },
            {
                label: <a onClick={handleUpdate} >Modifier</a>,
                key: '1',
                disabled : structureSelected === null ? true : false
            },
        ];

        const getAllStructures = () =>{
        getActions(endpoints.structures.LIST)
            .then((response)=>{
                setStructures(response.data)
            })
        }

        useEffect(()=>{
            getAllStructures()
        },[])

        return(
            <>
                <Form
                    form={hospitalisationForm}
                    layout="vertical"
                    name="hospitalisation_form"
                    onFinish={onFinish}
                >
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Date entrée"
                                name="date_entree" 
                                initialValue={null}
                            >
                                <DatePicker placeholder='Sélectionner'  format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Date de sortie"
                                name="date_sortie" 
                                initialValue={null}
                            >
                                <DatePicker placeholder='Sélectionner' format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        
                    </Row>

                    <Row  gutter={10} align={"middle"} >
                        <Col xs={24} sm={24} md={24} lg={18} xl={18} >
                            <Form.Item 
                                label="Structures"
                                name="code_structure" 
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Structures"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                    {
                                        structures.map((item , key)=>(
                                            <Option key={key}  value={item.code_structure} > {item.lib_structure} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                            <div style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                <Dropdown
                                    menu={{items,}}
                                    trigger={['click']}
                                >
                                    <div style={{cursor:"pointer"}} >
                                        <PlusOutlined style={{fontSize:14}} />
                                        <EditOutlined style={{fontSize:14}} />
                                    </div>
                                </Dropdown>
                            </div>
                        </Col>
                    </Row>
                    {/* <Row gutter={10} >
                        <Col span={colSizes.size3} >
                            <Form.Item 
                                label="Service"
                                name="service" 
                                initialValue={null}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Service"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                >     
                                    <Option key={1}  value={null} > Test </Option>
                                        
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={colSizes.size3} >
                            <Form.Item 
                                label="Référent"
                                name="referent" 
                                initialValue={null}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Référent"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                >     
                                    <Option key={1}  value={null} > Test </Option>
                                        
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row> */}
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                            <Form.Item 
                                label="Motif"
                                name="motif" 
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                            <div style={{display:"flex",justifyContent:"center",alignItems:"center"}} >
                                <Button type='primary' htmlType='submit' >Valider</Button>
                            </div> 
                        </Col>
                    </Row> 
                    <br/>
                    
                </Form>

                <Modal
                    title={ operationType === "add" && "Ajouter une structure" || operationType === "update" && "Mettre à jour la structure "}
                    open={isModalVisible1}
                    onCancel={()=>{setIsModalVisible1(false)}}
                    footer={null}
                    destroyOnClose
                >
                    <AddStructure isModalVisible={isModalVisible1} setIsModalVisible={setIsModalVisible1} operationType={operationType} refresh={getAllStructures} itemSelected={structureSelected} />
                </Modal>
            </>
        )
    }

    const Hospitalisations = ({data , setData , setIsModalVisible}) => {
        
        return(
            <Card bordered>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}} >
                            <Button type='primary' onClick={()=>{setIsModalVisible(true)}} >Ajouter</Button>
                        </div> 
                    </Col>
                </Row> 
                <br/>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <DataTable 
                            dataSourceCopy={data}
                            setDataSourceCopy={setData}
                            columns={[
                                // {
                                //     title: 'Numéro',
                                //     dataIndex: 'num_hosto',
                                //     key: 'num_hosto',
                                //     render: (text) => <div className='table-data'>
                                //         {truncate(text,15)}
                                //     </div>
                                // },
                                {
                                    title: 'Code Structure',
                                    dataIndex: 'code_structure',
                                    key: 'code_structure'
                                },
                                {
                                    title: 'Date entrée',
                                    dataIndex: 'date_entree',
                                    key: 'date_entree'
                                },
                                {
                                    title: 'Date sortie',
                                    dataIndex: 'date_sortie',
                                    key: 'date_sortie'
                                },
                                {
                                    title: 'Motif',
                                    dataIndex: 'motif',
                                    key: 'motif'
                                },
                                {
                                    width : 'auto' ,
                                    render :  (item)=>(
                                        <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                            <DeleteOutlined 
                                                style={{color:"red"}}
                                                onClick={()=>{
                                                    const temp = data.filter((element)=>element.num_hosto !== item.num_hosto);
                                                    setData(temp);
                                                }} 
                                            />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
        )
    }

    const AntecedentsFamiliaux = () => {
        return (
            <Card bordered>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                        <Form.Item 
                            label="Père"
                            name="ant_pere" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                        <Form.Item 
                            label="Mère"
                            name="ant_mere" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                        <Form.Item 
                            label="Autres"
                            name="ant_autres"
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
            </Card> 
        )
    }


    const AddMaladieProf = ({patientObject  , maladiesProfData , setMaladiesProfData , setIsModalVisible}) => {
        const [maladieProfForm] =  Form.useForm();
        const [operationType , setOperationType] = useState("");
        const [maladiesPro , setMaladiesPro]= useState([]);
        const [isModalVisible1 , setIsModalVisible1] = useState(false);
        const [selectedMaladiePro , setSelectedMaladiePro] = useState(null);

        const onFinish = ()=> {
            maladieProfForm
            .validateFields()
            .then((values) => {
                let inc = 0; // increment
                let type_mp = "";
                
                for (let i = 0; i < maladiesPro.length; i++) {
                    if (maladiesPro[i].code_mp === values.code_mp) {
                         type_mp = maladiesPro[i].type_mp;
                    }
                }


                const payload = {
                    code_mp : values.code_mp ,
                    date_dec : new Date(values.date_dec).toISOString(),
                    description_mp : values.description_mp ,
                    num_tab : values.num_tab ,
                    numpat : patientObject.num_patient ,
                    observation : values.observation,
                    type_mp : type_mp,
                }; 

                // Tester l'existence de la maladie professionnelle dans la table des maladies professionnelles
                for (let i = 0; i < maladiesProfData.length; i++) {
                    if (maladiesProfData[i].code_mp === values.code_mp ) {
                        inc+=1;
                    }
                }

                if (inc === 1) {
                    message.warning('Cette maladie professionnelle a été déjà ajouté à la table des maladies professionnelles')
                    setMaladiesProfData(maladiesProfData);
                    
                }else{
                    const temp = maladiesProfData.push(payload);
                    setMaladiesProfData([...maladiesProfData] , temp);
                    maladieProfForm.resetFields();
                    setIsModalVisible(false);
                }

            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
        }

        const handleAdd = () => {
            //sessionStorage.removeItem("currentPoste");
            setIsModalVisible1(true);
            setOperationType("add");
        }
        const handleUpdate = (item) => {
            setIsModalVisible1(true);
            setOperationType("update"); 
            maladiesPro.forEach(element => {
                if (element.code_poste === selectedMaladiePro ) {
                  // console.log(element)
                  // sessionStorage.setItem("currentPoste", JSON.stringify(element)); 
                  setSelectedMaladiePro(element);
                }
            });
        }

        const items = [
            {
                label: <a onClick={handleAdd} >Ajouter</a> ,
                key: '0',
            },
            {
                label: <a onClick={handleUpdate} >Modifier</a>,
                key: '1',
                disabled : selectedMaladiePro === null ? true : false
            },
        ];
        
        const getAllMaladiesPro = () => {
            getActions(endpoints.maladiesProfessionelles.LIST)
            .then((response)=>{
                setMaladiesPro(response.data)
            })
        }
        useEffect(()=>{
            getAllMaladiesPro();
        },[])

        return (
            <>
                <Form
                    form={maladieProfForm}
                    layout="vertical"
                    name="maladie_prof_form"
                    onFinish={onFinish}
                    onValuesChange={(changedValues , values)=>{
                    if (changedValues.code_mp) {
                        for (let i = 0; i < maladiesPro.length; i++) {
                            if (maladiesPro[i].code_mp === changedValues.code_mp) {
                                maladieProfForm.setFieldValue("num_tab",maladiesPro[i].num_tableau);
                                maladieProfForm.setFieldValue("description_mp",maladiesPro[i].description_mp);
                            }
                        }
                    }
                    }}
                >
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                            <Form.Item 
                                label="Date déclaration"
                                name="date_dec" 
                            >
                                <DatePicker placeholder='Sélectionner'  format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        
                    </Row>
                    <Row gutter={[24,24]}>
                        <Col xs={24} sm={24} md={24} lg={18} xl={18} >
                            <Form.Item 
                                label="Type Maladie"
                                name="code_mp" 
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Poste"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    // onChange={(value)=>{
                                    //     setSelectedMaladiePro(value);
                                    //     form.setFieldValue("num_tab",value.num_tab);
                                    //     console.log(value);
                                    // }}
                                >     
                                    {
                                        maladiesPro.map((item , key)=>(
                                            <Option key={key}  value={item.code_mp} > {item.type_mp} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={18} xl={18}>
                            <div style={{width:"100%",height:"100%", display:"flex",justifyContent:"center",alignItems:"center"}} >
                                <Dropdown
                                    menu={{items,}}
                                    trigger={['click']}
                                >
                                    <div style={{cursor:"pointer"}} >
                                        <PlusOutlined style={{fontSize:14}} />
                                        <EditOutlined style={{fontSize:14}} />
                                    </div>
                                </Dropdown>
                            </div>
                        </Col>
                    </Row> 
                    <Row gutter={[24,24]}>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8} >
                            <Form.Item 
                                label="Numéro au tableau"
                                name="num_tab"
                            >
                                <InputNumber disabled />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={18} xl={18} >
                            <Form.Item 
                                label="Description maladie"
                                name="description_mp" 
                            >
                                <TextArea disabled rows={4} />
                            </Form.Item>
                        </Col>
                        
                    </Row> 
                    <Row gutter={[24,24]}>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                            <Form.Item 
                                label="Observations"
                                name="observation" 
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                    </Row> 
                    
                    <Row>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                            <div style={{display:"flex",justifyContent:"center",alignItems:"center"}} >
                                <Button type='primary' htmlType='submit' >Valider</Button>
                            </div> 
                        </Col>
                    </Row>
                </Form>

                <Modal
                    title={(operationType === "add" && "Ajouter un poste") || (operationType === "update" && "Mettre les données à jour")}
                    open={isModalVisible1}
                    onCancel={()=>{setIsModalVisible1(false)}}
                    footer={null}
                    destroyOnClose
                >
                    <AddTypeMaladie isModalVisible={isModalVisible1} setIsModalVisible={setIsModalVisible1} operationType={operationType} refresh={getAllMaladiesPro} itemSelected={selectedMaladiePro} />
                </Modal>
            </>

        )
    }

    const MaladiesProfessionnelles = ({data, setData , setIsModalVisible}) => {
        
        return (
            <Card bordered >
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}} >
                            <Button type='primary' onClick={()=>{setIsModalVisible(true)}} >Ajouter</Button>
                        </div> 
                    </Col>
                </Row> 
                <br/>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <DataTable 
                            dataSourceCopy={data}
                            setDataSourceCopy={setData}  
                            columns={[
                                {
                                    title: 'Date MP',
                                    dataIndex: 'date_dec',
                                    key: 'date_dec'
                                },
                                {
                                    title: 'Type MP',
                                    dataIndex: 'type_mp',
                                    key: 'type_mp'
                                },
                                {
                                    title: 'N° Tab',
                                    dataIndex: 'num_tab',
                                    key: 'num_tab'
                                },
                                {
                                    title: 'Type MP',
                                    dataIndex: 'type_mp',
                                    key: 'type_mp'
                                },
                                {
                                    title: 'Observation',
                                    dataIndex: 'observation',
                                    key: 'observation'
                                },
                                {
                                    width : 'auto' ,
                                    render :  (item)=>(
                                        <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                            <DeleteOutlined 
                                                style={{color:"red"}}
                                                onClick={()=>{
                                                    const temp = data.filter((element)=>element.code_mp !== item.code_mp);
                                                    setData(temp);
                                                }}  
                                            />
                                        </div>
                                    )
                                }
                            ]}      
                        />
                    </Col>
                </Row>
            </Card>
        )
    }


    const AddRisqueLieAuPoste = ({patientObject  , patientsPostsData , setPatientsPostsData , setIsModalVisible}) => {
        const [risquesPostesForm] = Form.useForm();
        const [operationType , setOperationType] = useState("");
        const [postes , setPostes]= useState([]);
        const [isModalVisible1 , setIsModalVisible1] = useState(false);
        const [selectedPoste , setSelectedPoste] = useState(null);

        const onFinish = ()=> {
            risquesPostesForm
            .validateFields()
            .then((values) => {
                let inc = 0; // increment
                let lib_poste = "";
                
                for (let i = 0; i < postes.length; i++) {
                    if (postes[i].code_poste === values.code_poste) {
                        lib_poste = postes[i].lib_poste;
                    }
                }


                const payload = {
                    code_poste : values.code_poste ,
                    date_deb : new Date(values.date_deb).toISOString(),
                    date_fin : new Date(values.date_fin).toISOString(),
                    lib_poste : lib_poste ,
                    nature_poste : values.nature_poste ,
                    risques_poste  : values.risques_poste,
                    
                    //numpat : patientObject.num_patient ,
                    
                }; 

                // Tester l'existence du poste dans la table des postes
                for (let i = 0; i < patientsPostsData.length; i++) {
                    if (patientsPostsData[i].code_poste === values.code_poste ) {
                        inc+=1;
                    }
                }

                if (inc === 1) {
                    message.warning('Risque lié à ce poste déjà existante')
                    setPatientsPostsData(patientsPostsData);
                    
                }else{
                    const temp = patientsPostsData.push(payload);
                    setPatientsPostsData([...patientsPostsData] , temp);
                    risquesPostesForm.resetFields();
                    setIsModalVisible(false);
                }

            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
        }
        
        const handleAdd = () => {
            sessionStorage.removeItem("currentPoste");
            setIsModalVisible1(true);
            setOperationType("add");
        }
        const handleUpdate = (item) => {
            setIsModalVisible1(true);
            setOperationType("update"); 
            postes.forEach(element => {
                if (element.code_poste === selectedPoste ) {
                    console.log(element)
                    sessionStorage.setItem("currentPoste", JSON.stringify(element)); 
                }
            });
        }

        const items = [
            {
                label: <a onClick={handleAdd} >Ajouter</a> ,
                key: '0',
            },
            {
                label: <a onClick={handleUpdate} >Modifier</a>,
                key: '1',
                disabled : selectedPoste === null ? true : false
            },
        ];
        
        const getAllPostes = () => {
            getActions(endpoints.postes.LIST)
            .then((response)=>{
                setPostes(response.data)
            })
        }
        useEffect(()=>{
            getAllPostes();
        },[])

        return (
            <>
                <Form
                    form={risquesPostesForm}
                    layout="vertical"
                    name="risques_postes_form"
                    onFinish={onFinish}
                    onValuesChange={(changedValues , values)=>{
                    if (changedValues.code_poste) {
                        for (let i = 0; i < postes.length; i++) {
                            if (postes[i].code_poste === changedValues.code_poste) {
                                risquesPostesForm.setFieldValue("nature_poste",postes[i].nature_poste);
                                risquesPostesForm.setFieldValue("risques_poste",postes[i].risques_poste);
                            }
                        }
                    }
                    }}
                >
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Date début"
                                name="date_deb" 
                            >
                                <DatePicker placeholder='Sélectionner'  format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Date fin"
                                name="date_fin" 
                            >
                                <DatePicker placeholder='Sélectionner' format="DD-MM-YYYY" />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={18} xl={18} >
                            <Form.Item 
                                label="Poste"
                                name="code_poste" 
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Poste"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    //onChange={(value)=>{setSelectedPoste(value)}}
                                >     
                                    {
                                        postes.map((item , key)=>(
                                            <Option key={key}  value={item.code_poste} > {item.lib_poste} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                            <div style={{width:"100%",height:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                <Dropdown
                                    menu={{items,}}
                                    trigger={['click']}
                                >
                                    <div style={{cursor:"pointer"}} >
                                        <PlusOutlined style={{fontSize:14}} />
                                        <EditOutlined style={{fontSize:14}} />
                                    </div>
                                </Dropdown>
                            </div>
                        </Col>
                    </Row>
                    <Row gutter={[24,24]}>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Nature travail"
                                name="nature_poste" 
                            >
                                <TextArea disabled rows={4} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={24} lg={12} xl={12} >
                            <Form.Item 
                                label="Risques liées"
                                name="risques_poste" 
                            >
                                <TextArea disabled rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                            <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}} >
                                <Button type='primary' htmlType='submit' >Valider</Button>
                            </div> 
                        </Col>
                    </Row> 

                </Form>
                

                <Modal
                    title={(operationType === "add" && "Ajouter un poste") || (operationType === "update" && "Mettre les données à jour")}
                    open={isModalVisible1}
                    onCancel={()=>{setIsModalVisible1(false)}}
                    footer={null}
                    destroyOnClose
                >
                    <AddPoste isModalVisible={isModalVisible1} setIsModalVisible={setIsModalVisible1} operationType={operationType} refresh={getAllPostes} />
                </Modal>
            </>
        )
    }

    const RisquesLiesAuPoste = ({data , setData , setIsModalVisible}) => {
        
        return (
            <Card bordered>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center"}} >
                            <Button type='primary' onClick={()=>{setIsModalVisible(true)}} >Ajouter</Button>
                        </div> 
                    </Col>
                </Row> 
                <br/>
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <DataTable 
                            dataSourceCopy={data}        
                            setDataSourceCopy={setData}
                            columns={[
                                {
                                    title: 'Code poste',
                                    dataIndex: 'code_poste',
                                    key: 'code_poste'
                                },
                                {
                                    title: 'Poste',
                                    dataIndex: 'lib_poste',
                                    key: 'lib_poste'
                                },
                                {
                                    title: 'Nature poste',
                                    dataIndex: 'nature_poste',
                                    key: 'nature_poste'
                                },
                                {
                                    title: 'Risques poste',
                                    dataIndex: 'risques_poste',
                                    key: 'risques_poste'
                                },
                                {
                                    title: 'Date Début',
                                    dataIndex: 'date_deb',
                                    key: 'date_deb'
                                },
                                {
                                    title: 'Date Fin',
                                    dataIndex: 'date_fin',
                                    key: 'date_fin'
                                },
                                {
                                    width : 'auto' ,
                                    render :  (item)=>(
                                        <div style={{width:"100%",display:"flex",justifyContent:"center",alignItems:"center"}} >
                                            <DeleteOutlined 
                                                style={{color:"red"}}
                                                onClick={()=>{
                                                    const temp = data.filter((element)=>element.code_poste !== item.code_poste);
                                                    setData(temp);
                                                }}  
                                            />
                                        </div>
                                    )
                                }
                            ]}
                        />
                    </Col>
                </Row>
            </Card>
        )
       
    }

  const items = [
    {
        key: '1',
        label: "Terrains et Addictions",
        children:  <TerrainsAddictions  /> ,
    },
    {
        key: '2',
        label: "Antécédents médicaux / Maladies",
        children:  <AntecedentsMedicaux data={maladiesData} setData={setMaladiesData} setIsModalVisible={setIsAddAntedecedentMedicalModalVisible}  /*data={listMaladies} setData={setListMaladies}*/ />,
        
    },
    {
        key: '3',
        label: "Hospitalisations",
        children: <Hospitalisations data={hospitalisationsData} setData={setHospitalisationsData} setIsModalVisible={setIsAddHospitalisationModalVisible} /*data={listHospitalisations} setData={setListHospitalisations}*/ />,
    },
    {
        key: '4',
        label: "Antécédents familiaux",
        children:  <AntecedentsFamiliaux />,
    },
    {
        key: '5',
        label: "Maladies Professionnelles",
        children:  <MaladiesProfessionnelles data={maladiesProfData} setData={setMaladiesProfData} setIsModalVisible={setIsAddMaladieProfessionnelleModalVisible} /*data={listMaladiesProf} setData={setListMaladiesProf}*/ /> ,
    },
    {
        key: '6',
        label: "Risques liés au postes",
        children:  <RisquesLiesAuPoste data={patientsPostsData} setData={setPatientsPostsData} setIsModalVisible={setIsAddPatientPostModalVisible} /*data={listPatientsPosts}  setData={setListPatientsPosts}*/ /> ,
    },
  ];

  const onFinish = () => {
    setLoading(true)
    console.log("Infos cliniques form");
    form
    .validateFields()
    .then((values)=>{
        setLoading(false)
        const payload =  {...initInfosConsultation , ...values};
        payload.listHospitalisations = hospitalisationsData;
        payload.listMaladies = maladiesData;
        payload.listMaladiesProf = maladiesProfData;
        payload.listPatientsPostes = patientsPostsData;
        //payload.numpat =currentObject.num_patient;
        console.log(payload);
        putActions(endpoints.dossierMedical.INFOS_CLINIQUES_UPDATE,payload)
        .then((response)=>{
            if (response.data && response.data !== undefined && response.data.Updated === true) {
                message.success("Infos cliniques mises à jour avec succès");
                form.resetFields();
                setSuscribe(Date.now())
               // getInfosCliniques();
            }
            else {
                message.error("Une erreur s'est produite, veuillez réessayer svp");
            }
        })
        
    })
    .catch((info)=>{
        setLoading(false);
        message.error("Une erreur s'est produite, veuillez réessayer svp");
        console.log('Validate Failed:', info);
    })
  }

 


  

  useEffect(()=>{
    const getInfosCliniques = () => {
        getActions(`${endpoints.dossierMedical.INFOS_CLINIQUES}?numpat=${currentObject.num_patient}`)
        .then((response)=>{
            //console.log(response.data)
            setInitInfosConsultation(response.data);
            setHospitalisationsData(response.data.listHospitalisations);
            setMaladiesData(response.data.listMaladies);
            setMaladiesProfData(response.data.listMaladiesProf);
            setPatientsPostsData(response.data.listPatientsPostes);
        })
    }
    getInfosCliniques();
  },[suscribe])
  return (
      <Card className='InfosCliniquesWrapper' loading={initInfosConsultation === null ? true : false} >
        {/* <Breadcrumb
          items={[
            {
              title : <a onClick={()=>{navigate("/myspace/home")}} ><HomeOutlined/></a>
            } ,
            {
              title : <a onClick={()=>{navigate("/myspace/patients")}} >Patients</a>
            } ,
            // {
            //   title : <a onClick={()=>{navigate("/myspace/patients/dossier")}} >Dossier Médical</a>
            // } ,
            {
                title : <a onClick={()=>{navigate(-1)}} >Dossier Médical</a>
            } ,
            {
              title : "Infos cliniques"
            } ,
          ]}
        /> <br/> */}
        
        <div style={{display:'flex',justifyContent:"space-between",alignItems:"center",flexDirection:"row"}} >
            <Title level={5}> Infos cliniques du Patient N° {currentObject.num_patient } / {currentObject.prenom_patient} {currentObject.nom_patient}  </Title> <br/>
            <div>
                <Button type="link" ghost  onClick={()=>{setSuscribe(Date.now())}}>Actualiser</Button>
                <Button type="primary"   onClick={()=>{navigate(-1)}}>Fermer</Button>
            </div>
        </div>
        <br/>
        <Form
            layout='vertical'
            form={form}
            name="infos_cliniques_form"
            onFinish={onFinish}
            initialValues={initInfosConsultation}
        >
          <Tabs defaultActiveKey="1" items={items} /> <br/>
          <Row>
              <Col span={12} offset={6}>
                  <div style={{display:"flex",justifyContent:"center",alignItems:"center"}} >
                      <Button className='button-cancel' type='ghost'  onClick={()=>{navigate(-1)}} >Annuler</Button> &nbsp;&nbsp;&nbsp;&nbsp;
                      <Button type='primary' loading={loading} htmlType='submit' > Enregistrer </Button>
                  </div> 
              </Col>
          </Row>
        </Form>

        <Modal
            title="Ajouter un antécedant médical"
            open={isAddAntedecedentMedicalModalVisible}
            onCancel={()=>{setIsAddAntedecedentMedicalModalVisible(false)}}
            footer={null}
            destroyOnClose
        >
                <AddAntecedentMedical 
                    maladiesData={maladiesData}
                    setMaladiesData={setMaladiesData}
                    patientObject={currentObject} 
                    setIsModalVisible={setIsAddAntedecedentMedicalModalVisible} 
                />
        </Modal>

        <Modal
            title="Ajouter une hospitalisation"
            open={isAddHospitalisationModalVisible}
            onCancel={()=>{setIsAddHospitalisationModalVisible(false)}}
            footer={null}
            destroyOnClose
        >
                <AddHospitalisation 
                    hospitalisationsData={hospitalisationsData}
                    setHospitalisationsData={setHospitalisationsData}
                    patientObject={currentObject} 
                    setIsModalVisible={setIsAddHospitalisationModalVisible} 
                />
        </Modal>

        <Modal
            title="Ajouter une maladie professionelle"
            open={isAddMaladieProfessionnelleModalVisible}
            onCancel={()=>{setIsAddMaladieProfessionnelleModalVisible(false)}}
            footer={null}
            destroyOnClose
        >
                <AddMaladieProf 
                    maladiesProfData={maladiesProfData}
                    setMaladiesProfData={setMaladiesProfData}
                    patientObject={currentObject} 
                    setIsModalVisible={setIsAddMaladieProfessionnelleModalVisible} 
                />
        </Modal>

        <Modal
            title="Ajouter un rique lié au poste"
            open={isAddPatientPostModalVisible}
            onCancel={()=>{setIsAddPatientPostModalVisible(false)}}
            footer={null}
            destroyOnClose
        >
                <AddRisqueLieAuPoste 
                    patientsPostsData={patientsPostsData}
                    setPatientsPostsData={setPatientsPostsData}
                    patientObject={currentObject} 
                    setIsModalVisible={setIsAddPatientPostModalVisible} 
                />
        </Modal>
        
      </Card>
  )
}

export default InfosCliniques