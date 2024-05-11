import { HomeOutlined, OrderedListOutlined } from '@ant-design/icons'
import { Breadcrumb, Button, Card, Col, Divider, Flex, Form, Input, InputNumber, Modal, Radio, Row, Select, Space, Tooltip, Typography } from 'antd';
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { codesPrescriptions } from '../../constants/app.constants';
import AddAndEditDropdown from '../../components/common/AddAndEditDropdown/AddAndEditDropdown';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import ListProduits from '../../components/specific/ListProduits/ListProduits';

const {Title} = Typography;
const {Option} = Select;

function FicheProduit() {
    const [form] = Form.useForm();
    const {data , isLoading , error} = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ORD}`);
    const listMedicaments = data;
    //console.log(data)
    const [open,setOpen] = useState(false);

    const getMedocObjectByCodeActe = (id , list) => {
        let obj = null;
        for (let i = 0; i < list.length; i++) {
            if (list[i].codeacte === id ) {
                obj = list[i];
            } 
        }

        return obj;
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
                    }
                   
                }}
            >
                <Row gutter={[24,24]} >
                    <Col xs={24} sm={12} md={8} lg={12} xl={12} >
                        <Form.Item 
                            label="Créer produit"
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
                            <Input/>
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
                                name="forme_galenique"  
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Forme"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                >     
                                    <Option key={"comprimes"}  value={"comprimes"} > Comprimés </Option>
                                    <Option key={"cuilliere"}  value={"cuilliere"} > Cuillièrées </Option>
                                    <Option key={"ovules"}  value={"ovules"} > Ovules </Option>
                                    <Option key={"application"}  value={"application"} > Applications </Option>
                                    <Option key={"ampoules"}  value={"ampoules"} > Ampoules </Option>
                                    <Option key={"sachets"}  value={"sachets"} > Sachets </Option>
                                    <Option key={"injections"}  value={"injections"} > Injections </Option>
                                    <Option key={"gouttes"}  value={"gouttes"} > Gouttes </Option>
                                    <Option key={"gellules"}  value={"gellules"} > Gellules </Option>
                                    <Option key={"suppositoires"}  value={"suppositoires"} > Suppositoires </Option>

                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: (<span>Ajouter</span>) ,
                                },
                                {
                                    label: <span>Modifier</span>,
                                    key: '1',
                                    //disabled : motifSelected === null ? true : false
                                },
                            ]} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Famille"
                                name="famille" 
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
                                    <Option key={"1"}  value={"1"} > Koffi </Option>
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: (<span>Ajouter</span>) ,
                                },
                                {
                                    label: <span>Modifier</span>,
                                    key: '1',
                                    //disabled : motifSelected === null ? true : false
                                },
                            ]} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Conditionnement"
                                name="conditionnement" 
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
                                    <Option key={"1"}  value={"1"} > Conditionnement </Option>
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[
                                {
                                    key: '0',
                                    label: (<span>Ajouter</span>) ,
                                },
                                {
                                    label: <span>Modifier</span>,
                                    key: '1',
                                    //disabled : motifSelected === null ? true : false
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
        </Card>
    )
}

export default FicheProduit