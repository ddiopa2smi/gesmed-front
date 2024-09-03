import { HomeOutlined, OrderedListOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Tooltip, Typography, message } from 'antd';
import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { codesPrescriptions } from '../../constants/app.constants';
import AddAndEditDropdown from '../../components/common/AddAndEditDropdown/AddAndEditDropdown';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import ListProduits from '../../components/specific/ListProduits/ListProduits';
import AddFamilleMedoc from '../../components/specific/AddFamilleMedoc/AddFamillleMedoc';
import AddConditionnement from '../../components/AddConditionnement/AddConditionnement';
import AddFormeGalenique from '../../components/AddFormeGalenique/AddFormeGalenique';
import { deletePopup, generateRandomCode } from '../../utils/helpers';
import { deleteActions, postActions, putActions } from '../../actions/actions';
import BackButton from '../../components/common/BackButton/BackButton';


const {Title} = Typography;
const {Option} = Select;

function FicheProduit() {
    const navigate = useNavigate();
    const {state} = useLocation();
    const currentRecord = state?.currentRecord;
    const [form] = Form.useForm();
    const {data : listMedicaments , isLoading , error} = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`);
    //console.log(listMedicaments)
    const {data : familleMedocsList , isLoading : familleMedocsListLoading , onRefresh : listFamilleMedocRefresh} = useFetch(endpoints.familleMedoc.LIST);
    const {data : conditionnementsList , isLoading : conditionnementsListLoading , onRefresh : conditionnementsListRefresh} = useFetch(endpoints.conditionnements.LIST);
    const {data : formesGaleniqueList , isLoading : formesGaleniqueListLoading , onRefresh : formesGaleniqueListRefresh} = useFetch(endpoints.forme_galenique.LIST);

    const [currentSelectableTask , setCurrentSelectableTask] = useState("");
    const [operationType , setOperationType] = useState(null);
    const [open,setOpen] = useState(false);
    const [open2,setOpen2] = useState(false);


    const [familleMedocSelected , setFamilleMedocSelected] = useState(null);
    const [formeGaleniqueSelected , setFormeGaleniqueSelected] = useState(null);
    const [conditionnementSelected , setConditionnementSelected] = useState(null);


    const [formLoading , setFormLoading] = useState(false);


    const save = () => {
        form
        .validateFields()
        .then((values) => {
            console.log(values)
            postActions(endpoints.fiche_produit.ADD,values)
            .then((response)=>{
                if (response?.data) {
                    message.success("Nouvelle fiche produit ajoutée avec succès");
                    
                    //setOpen(false);
                    form.resetFields();
                    //onRefresh();
                }

                
            })
            .finally(()=>{
                setFormLoading(false)
            })
            //setFormLoading(true);
            // switch (operationType) {
            //     case "add":
            //             // values.num_patient = values.benef;
            //             // values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
            //             console.log(values)
            //             // postActions(endpoints.fiche_produit.ADD,values)
            //             // .then((response)=>{
            //             //     if (response?.data) {
            //             //         message.success("Nouvelle fiche produit ajoutée avec succès");
                                
            //             //         //setOpen(false);
            //             //         form.resetFields();
            //             //         onRefresh();
            //             //     }

                            
            //             // })
            //             // .finally(()=>{
            //             //     setFormLoading(false)
            //             // })
                        
            //         break;
            //     case "update":
            //             // values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
            //             // values.num_patient = currentRecord ? currentRecord.num_patient : null;
            //             // putActions(endpoints.patients.UPDATE,values)
            //             // .then((response)=>{
            //             //     setFormLoading(false);
            //             //     message.success("Opération éffectuée avec succès");
            //             //     form.resetFields();
            //             // })
            //         break;
            //     default:
            //         break;
            // }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

    const openModal = (operation , selectableTask) => {
        if(operation === "add"){
            setFamilleMedocSelected(null)
        }
        setOpen2(true);
        setOperationType(operation);
        setCurrentSelectableTask(selectableTask);
    }

    const getMedocObjectByCodeActe = (id , list) => {
        let obj = null;
        for (let i = 0; i < list.length; i++) {
            if (list[i].codeacte === id ) {
                obj = list[i];
            } 
        }

        return obj;
    }


    const onDelete = (currentSelectableTask , record) => {
        deletePopup()
        .then((result)=>{
            if (result.isConfirmed) {
                switch (currentSelectableTask) {
                    case "FAMILLE_MEDOC":
                        deleteActions(`${endpoints.familleMedoc.DELETE}/${record?.code_famille}`)
                        .then((response)=>{
                            if (response?.data) {
                                message.success("Ligne retirée avec succès");
                                listFamilleMedocRefresh()
                            }
                        })
                        break;
                    case "CONDITIONNEMENT":
                        deleteActions(`${endpoints.conditionnements.DELETE}/${record?.cond_code}`)
                        .then((response)=>{
                            if (response?.data) {
                                message.success("Ligne retirée avec succès");
                                conditionnementsListRefresh()
                            }
                        })
                        break;
                    case "FORME_GALENIQUE":
                        deleteActions(`${endpoints.forme_galenique.DELETE}/${record?.code_forme}`)
                        .then((response)=>{
                            if (response?.data) {
                                message.success("Ligne retirée avec succès");
                                formesGaleniqueListRefresh()
                            }
                        })
                        break;
                
                    default:
                        break;
                }
            }
        })
    }
    return (
        <Card className='FicheProduitWrapper' >
            <Flex justify='flex-start' align='center' >
                <BackButton />
            </Flex>
            <Flex justify="flex-end" align="center" >
                <Space>
                    
                    <Tooltip title="Actualiser" >
                        <Button type='primary' icon={<OrderedListOutlined/>} onClick={()=>{navigate("/myspace/gestion-fiche-produits")}} >Liste des produits</Button>
                    </Tooltip> 
                </Space>
            </Flex>
            <Title level={3} > Fiche Produit </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
                onFinish={save}
                initialValues={currentRecord}
                onValuesChange={(changedValues , allValues)=> {
                    if (changedValues.code_produit) {
                        const obj = getMedocObjectByCodeActe(changedValues.code_produit , listMedicaments);
                        form.setFieldValue("code_cip", obj.codeacte);
                        form.setFieldValue("libelle_produit", obj.libacte);
                        // form.setFieldValue("reference",generateRandomCode())
                    }


                    if (changedValues.famille) {
                        const code = changedValues.famille;
                        familleMedocsList.forEach(element => {
                            if (element.code_famille === code) {
                                setFamilleMedocSelected(element);
                            }
                        });
                    }

                    if (changedValues.cond) {
                        const code = changedValues.cond;
                        conditionnementsList.forEach(element => {
                            if (element.cond_code === code) {
                                setConditionnementSelected(element);
                            }
                        });
                    }

                    if (changedValues.forme) {
                        const code = changedValues.forme;
                        formesGaleniqueList.forEach(element => {
                            if (element.code_forme === code) {
                                setFormeGaleniqueSelected(element);
                            }
                        });
                    }
                   
                }}
            >
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={12} md={8} lg={12} xl={12} >
                        <Form.Item 
                            label="DCI (Dénomination commune internationale)"
                            name="dci" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={isLoading}
                            >     
                                {
                                    listMedicaments.map((item)=>(
                                        <Option key={item.codeacte}  value={item.codeacte} > {item.libacte} </Option>
                                    ))
                                }  
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={12} xl={12} >
                        <Form.Item 
                            label="Produit"
                            name="code_produit" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={isLoading}
                            >     
                                {
                                    listMedicaments.map((item)=>(
                                        <Option key={item.codeacte}  value={item.codeacte} > {item.libacte} </Option>
                                    ))
                                }  
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider  orientation="left">Identification</Divider>

                <Row gutter={[24,24]} >
                    
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Désignation"
                            name="libelle_produit" 
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Code CIP"
                            name="code_cip" 
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Référence interne"
                            name="code_produit" 
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            style={{
                                display:"none"
                            }}
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[24,24]}>    
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Forme galénique"
                                name="forme"  
                                style={{width:"90%"}}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Choisir..."
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    loading={formesGaleniqueListLoading}
                                    allowClear
                                >     
                                    {
                                        formesGaleniqueList.map((item , key)=>(
                                            <Option key={key}  value={item?.code_forme} > {item?.libelle_forme} </Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: "Ajouter" ,
                                    onClick : ()=> openModal("add","FORME_GALENIQUE")
                                },
                                {
                                    label: "Modifier",
                                    key: '1',
                                    onClick : ()=> openModal("update","FORME_GALENIQUE"),
                                    disabled : formeGaleniqueSelected === null
                                },
                                {
                                    label: "Supprimer",
                                    key: '2',
                                    onClick : ()=> onDelete("FORME_GALENIQUE",formeGaleniqueSelected),
                                    disabled : formeGaleniqueSelected === null
                                }
                            ]} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' justify='flex-start' >
                            <Form.Item 
                                label="Famille"
                                name="famille" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Choisir..."
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    isLoading={familleMedocsListLoading}
                                >     
                                    {
                                        familleMedocsList.map((item , key)=>(
                                            <Option key={key}  value={item?.code_famille} > {item?.libelle_famille} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: "Ajouter" ,
                                    onClick : ()=> openModal("add","FAMILLE_MEDOC")
                                },
                                {
                                    label: "Modifier",
                                    key: '1',
                                    onClick : ()=> openModal("update","FAMILLE_MEDOC"),
                                    disabled : familleMedocSelected === null
                                },
                                {
                                    label: "Supprimer",
                                    key: '2',
                                    onClick : ()=> onDelete("FAMILLE_MEDOC",familleMedocSelected),
                                    disabled : familleMedocSelected === null
                                }
                            ]} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Conditionnement"
                                name="cond" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Choisir..."
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    isLoading={conditionnementsListLoading}
                                >     
                                    {
                                        conditionnementsList.map((item , index)=>(
                                            <Option key={index}  value={item?.cond_code} > {item?.cond_lib} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: "Ajouter" ,
                                    onClick : ()=> openModal("add","CONDITIONNEMENT")
                                },
                                {
                                    label: "Modifier",
                                    key: '1',
                                    onClick : ()=> openModal("update","CONDITIONNEMENT"),
                                    disabled : conditionnementSelected === null
                                },
                                {
                                    label: "Supprimer",
                                    key: '2',
                                    onClick : ()=> onDelete("CONDITIONNEMENT",conditionnementSelected),
                                    disabled : conditionnementSelected === null
                                },
                            ]} />
                        </Flex>
                    </Col>
                    
                </Row>

                <Row gutter={30}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Descriptif"
                            name="descriptif" 
                            initialValue="spec"
                        >
                            <Radio.Group>
                                <Radio value="spec">Spécialité</Radio>
                                <Radio value="gen">Générique</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Statut"
                            name="statut" 
                            initialValue="payant"
                        >
                            <Radio.Group>
                                <Radio value="payant">Payant</Radio>
                                <Radio value="gratuit">Gratuit</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                </Row>

                <Divider  orientation="left">Tarif</Divider>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Prix d'achat"
                            name="prix_achat" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber style={{width:'100%'}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Prix de vente"
                            name="prix_vente" 
                            rules={[
                                {
                                required: true,
                                message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber style={{width:'100%'}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Unité de vente"
                            name="unite_vente" 
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Choisir..."
                                optionFilterProp="children" 
                                //filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                {/* {
                                    pathologiesList.map((item , key)=>(
                                        <Option key={key}  value={item.code_patho} > {item.libelle_patho} </Option>
                                    ))
                                } */}
                                <Option key={"1"}  value="Boite" > Boite </Option>
                                <Option key={"2"}  value="Comprime" > Comprimés </Option>
                                <Option key={"3"}  value="Plaquette" > Plaquettes </Option>
                                    
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Divider  orientation="left">Autres</Divider>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Emplacement"
                            name="emplacement" 
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Refrigéré?"
                            name="refrigere" 
                            initialValue={false}
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Radio.Group>
                                <Radio value={true}>Oui</Radio>
                                <Radio value={false}>Non</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Quantité stock mini"
                            name="qte_stock_mini" 
                            initialValue={10}
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={6} xl={6}>
                        <Form.Item 
                            label="Délai péremption (jours)"
                            name="delai_peremtion" 
                            initialValue={10}
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <InputNumber style={{width:"100%"}} />
                        </Form.Item>
                    </Col>
                </Row>
                <br/>
                <FormFooter 
                    loading={formLoading}
                    htmlType="submit"
                />
            </Form>


            {/* <Modal 
                // styles={{
                //     header : {
                //         background : "red"
                //     }
                // }}
                width={1000}
                title="Liste des produits" 
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    //setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                <ListProduits />
            </Modal> */}

            <Modal 
                title="Ajout rapide"
                open={open2} 
                onCancel={()=>{
                    setOpen2(false);
                    //setCurrentRecord(null);
                }}
                footer={null}
                destroyOnClose
            >
                {currentSelectableTask === "FAMILLE_MEDOC" && <AddFamilleMedoc  setOpen={setOpen2} operationType={operationType} onRefresh={listFamilleMedocRefresh} currentRecord={familleMedocSelected} /> }
                {currentSelectableTask === "CONDITIONNEMENT" && <AddConditionnement  setOpen={setOpen2} operationType={operationType} onRefresh={conditionnementsListRefresh} currentRecord={conditionnementSelected} /> }
                {currentSelectableTask === "FORME_GALENIQUE" && <AddFormeGalenique  setOpen={setOpen2} operationType={operationType} onRefresh={formesGaleniqueListRefresh} currentRecord={formeGaleniqueSelected} /> }
            </Modal>
        </Card>
    )
}

export default FicheProduit