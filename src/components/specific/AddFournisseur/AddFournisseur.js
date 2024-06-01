import { Col, Form, Input, Row, Select, DatePicker, message, Card, Button, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { getActions, postActions, putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import useFetch from '../../../utils/hooks/useFetch';
import dayjs from "dayjs"
import axios from 'axios';
import { API_URL } from '../../../constants/environment.constants';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

const {TextArea} = Input;
const { Option } = Select;
const { Text , Title } = Typography;

function AddFournisseur({ setOpen , operationType , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
    const [typeContact , setTypeContact] = useState("PHONE");
   

     
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                       
                        console.log(values)
                        postActions(endpoints.fournisseurs.ADD,values)
                        .then((response)=>{
                            //setFormLoading(false);

                            if (response?.data) {
                                message.success("Nouveau fournisseur ajouté avec succès");
                                form.resetFields();
                                onRefresh();
                            }
                            
                        })
                        .finally(()=>{
                            setFormLoading(false)
                            setOpen(false);
                        })
                        
                    break;
                case "update":
                        values.fourn_code = currentRecord ? currentRecord.fourn_code : null;
                        putActions(endpoints.fournisseurs.UPDATE,values)
                        .then((response)=>{
                            setFormLoading(false);
                            if (response?.data) {
                                message.success("Opération éffectuée avec succès");
                                form.resetFields();
                                onRefresh();
                            }
                            
                        })
                        .finally(()=>{
                            setFormLoading(false)
                            setOpen(false);
                        })
                    break;
                default:
                    break;
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

   
    // const handleMatricule = (e) => {
    //     setMatriculeToSearch(e.target.value)
    // }

    

    // useEffect(()=>{
    //     const searchPatientByMatricule = (value) => {
    //         if (value && value !== null) { 
    //             getActions(`/api/Participant/Patient/${value}`)
    //             .then((response)=>{
    //                 if (response?.data) {
    //                     setBenefLuiMeme(response.data)
    //                     getActions(`/api/Benef/list/${response.data.numcont}`)
    //                     .then((res)=>{
    //                         const data = res.data ;
    //                         console.log(data);
    //                         setListBeneficiaires(data);
    //                     })
    //                 }
    //             })
    //         }
    //     }
    //     searchPatientByMatricule(matriculeToSearch)
    // },[matriculeToSearch])

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
            preserve={false}
            initialValues={currentRecord}
            onValuesChange={(changedValues , values)=>{
                // if (changedValues.benef) {
                //     //console.log(changedValues)
                //     let benefSelected = null; 
                //     for (let i = 0; i < listBeneficiaires.length; i++) {
                //         const element = listBeneficiaires[i];
                //         if (element.matribenef === changedValues.benef) {
                //             benefSelected = element;
                //             break;
                //         }
                //     }
                    
                //     //console.log(benefSelected)
                //     //console.log(benefLuiMeme)
                //     if (changedValues.benef === benefLuiMeme.matipm) {
                //         form.setFieldValue("nom_patient",benefLuiMeme?.nom)
                //         form.setFieldValue("prenom_patient",benefLuiMeme?.prenom)
                //     }else{
                //         form.setFieldValue("nom_patient",benefSelected?.nom)
                //         form.setFieldValue("prenom_patient",benefSelected?.prenoms)
                //     }
                //     form.setFieldValue("sexe_patient",benefSelected?.sexe)
                //     form.setFieldValue("datenaiss_patient", dayjs(new Date(benefSelected.datenaiss)))
                // }
                
            }}
        >
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="fourn_raisoc" 
                        label="Raison sociale"
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
                
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="adresse" 
                        label="Adresse"
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
            </Row>

            <Row gutter={[8,8]} >
                
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item 
                        name="email" 
                        label="Email"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                            {
                                type : "email",
                                message : "Veuillez entrer un email dans ce champ"
                            }
                        ]}
                        //initialValue={currentRecord?.type_patient}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
            </Row>
            
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="tel_fixe" 
                        label="Téléphone fixe"
                        // rules={[
                        //     {
                        //         required: false,
                        //         message: 'Champ obligatoire',
                        //     },
                        //     ({getFieldValue})=>({
                        //         validator(_,value) {
                        //             if (/^\d{9}$/.test(value)) {
                        //                 return Promise.resolve()
                        //             }else{
                        //                 return Promise.reject(new Error("Veuillez saisir un numéro de téléphone valide."))
                        //             }
                        //         }
                        //     })
                        // ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
                
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="tel_portable" 
                        label="Téléphone portable"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                            ({getFieldValue})=>({
                                validator(_,value) {
                                    if (/^\d{9}$/.test(value)) {
                                        return Promise.resolve()
                                    }else{
                                        return Promise.reject(new Error("Veuillez saisir un numéro de téléphone valide."))
                                    }
                                }
                            })
                        ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
            </Row>

            
            <Title level={4}>Contacts</Title>          
            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="contact_qualite" 
                        label="Qualité"
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Champ obligatoire',
                        //     },
                        // ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="contact_nom" 
                        label="Nom"
                        // rules={[
                        //     {
                        //         required: true,
                        //         message: 'Champ obligatoire',
                        //     },
                        // ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="contact_tel" 
                        label="Téléphone contact"
                        // rules={[
                        //     // {
                        //     //     required: true,
                        //     //     message: 'Champ obligatoire',
                        //     // },
                        //     // ({getFieldValue})=>({
                        //     //     validator(_,value) {
                        //     //         if (/^\d{9}$/.test(value)) {
                        //     //             return Promise.resolve()
                        //     //         }else{
                        //     //             return Promise.reject(new Error("Veuillez saisir un numéro de téléphone valide."))
                        //     //         }
                        //     //     }
                        //     // })
                        // ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="contact_email" 
                        label="Email"
                        rules={[
                            // {
                            //     required: true,
                            //     message: 'Champ obligatoire',
                            // },
                            {
                                type : "email",
                                message : "Veuillez entrer un email dans ce champ"
                            }
                        ]}
                    >
                            <Input/>
                    </Form.Item>
                </Col>
            </Row>


            {/* <Row gutter={[8,8]} >
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Text>Autres contacts</Text> 
                    <br/>
                    <br/>
                    <Form.List 
                        name="contacts" 
                    >
                        {
                            (fields , {add , remove}) => (
                                <div
                                    style={{
                                        display : "flex",
                                        rowGap : 16 , 
                                        flexDirection : "column"
                                    }}
                                >
                                    {
                                        fields.map((field)=>(
                                            <Card
                                                key={field.key}
                                                size='small'
                                                title={`Contact ${field.name + 1}`}
                                                extra={
                                                    <CloseOutlined onClick={()=>{remove(field.name)}} />
                                                }
                                            >
                                                <Form.Item
                                                    label="Type de contact"
                                                    name={[field.name , 'type']}
                                                    rules={[
                                                        {
                                                            required: true,
                                                            message: 'Champ obligatoire',
                                                        },
                                                    ]}
                                                >
                                                        <Select
                                                            style={{width:'100%',background:"transparent"}}
                                                            showSearch
                                                            placeholder="Type de contact"
                                                            optionFilterProp="children" 
                                                            filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                                            onChange={(value)=>{setTypeContact(value)}}
                                                            defaultValue={"PHONE"}
                                                        >     
                                                           <Option key={1}  value={"PHONE"} > Téléphone mobile </Option>
                                                           <Option key={2}  value={"FIXE"} > Téléphone fixe </Option>
                                                           <Option key={3}  value={"MAIL"} > Email </Option>
                                                        </Select>
                                                </Form.Item>
                                                {
                                                    typeContact === "MAIL" && 
                                                    <Form.Item
                                                        label="Contact"
                                                        name={[field.name , 'value']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Champ obligatoire',
                                                            },
                                                            {
                                                                type : "email",
                                                                message : "Entrer un email svp"
                                                            }
                                                           
                                                        ]}
                                                    >
                                                        <Input  />
                                                    </Form.Item>
                                                }
                                                {
                                                    (typeContact === "PHONE" || typeContact === "FIXE") && 
                                                    <Form.Item
                                                        label="Contact"
                                                        name={[field.name , 'value']}
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Champ obligatoire',
                                                            },
                                                            ({getFieldValue})=>({
                                                                validator(_,value) {
                                                                    if (/^\d{9}$/.test(value)) {
                                                                        return Promise.resolve()
                                                                    }else{
                                                                        return Promise.reject(new Error("Veuillez saisir un numéro de téléphone valide."))
                                                                    }
                                                                }
                                                            })
                                                        ]}
                                                    >
                                                        <Input />
                                                    </Form.Item>
                                                }
                                            </Card>
                                            
                                        ))
                                    }
                                    <Button type='dashed' onClick={()=>{add()}} style={{marginBottom : 24}} icon={<PlusOutlined/>} > Ajouter un contact</Button>
                                </div>
                            )
                        }
                    </Form.List>
                </Col>
            </Row> */}

            <FormFooter 
                loading={formLoading}
                onCancel={()=>{setOpen(false)}}
                htmlType='submit'
            />

        </Form>
    )
}

export default AddFournisseur