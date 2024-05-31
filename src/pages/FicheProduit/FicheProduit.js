import { HomeOutlined, OrderedListOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Tooltip, Typography, message } from 'antd';
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { deleteActions } from '../../actions/actions';


const {Title} = Typography;
const {Option} = Select;

function FicheProduit() {
    const [form] = Form.useForm();
    const {data : listMedicaments , isLoading , error} = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`);
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
            <Flex justify="flex-end" align="center" >
                <Space>
                    
                    <Tooltip title="Actualiser" >
                        <Button type='primary' icon={<OrderedListOutlined/>} onClick={()=>{setOpen(true)}} >Liste des produits</Button>
                    </Tooltip> 
                </Space>
            </Flex>
            <Title level={3} > Fiche Produit </Title>
            <br/>
            <Form
                layout='vertical'
                form={form}
                onValuesChange={(changedValues , allValues)=> {
                    if (changedValues.code_produit) {
                        const obj = getMedocObjectByCodeActe(changedValues.code_produit , listMedicaments);
                        form.setFieldValue("code_interne", obj.codeacte);
                        form.setFieldValue("designation", obj.libacte);
                        form.setFieldValue("reference",generateRandomCode())
                    }


                    if (changedValues.code_famille) {
                        const code = changedValues.code_famille;
                        familleMedocsList.forEach(element => {
                            if (element.code_famille === code) {
                                setFamilleMedocSelected(element);
                            }
                        });
                    }

                    if (changedValues.cond_code) {
                        const code = changedValues.cond_code;
                        conditionnementsList.forEach(element => {
                            if (element.cond_code === code) {
                                setConditionnementSelected(element);
                            }
                        });
                    }

                    if (changedValues.code_forme) {
                        const code = changedValues.code_forme;
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
                            label="Référence interne"
                            name="reference" 
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
                            label="Désignation"
                            name="designation" 
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
                            name="code_interne" 
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
                </Row>

                <Row gutter={[24,24]}>    
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Forme galénique"
                                name="code_forme"  
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
                                name="code_famille" 
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
                                name="cond_code" 
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
                            initialValue={1}
                        >
                            <Radio.Group>
                                <Radio value={1}>Spécialité</Radio>
                                <Radio value={2}>Générique</Radio>
                            </Radio.Group>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Statut"
                            name="statut" 
                            initialValue={1}
                        >
                            <Radio.Group>
                                <Radio value={1}>Payant</Radio>
                                <Radio value={2}>Gratuit</Radio>
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
                                <Option key={"1"}  value={"boites"} > Boites </Option>
                                <Option key={"2"}  value={"comprimes"} > Comprimés </Option>
                                <Option key={"3"}  value={"plaquettes"} > Plaquettes </Option>
                                    
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
                            initialValue={true}
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
                            name="delai_peremption" 
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
                <FormFooter />
            </Form>


            <Modal 
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
            </Modal>

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