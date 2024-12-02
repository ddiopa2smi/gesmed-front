import { Breadcrumb, Button, Card, Col, Divider, Form, Input, InputNumber, Row, Select, Typography, Upload, message } from 'antd';
import { useState } from 'react';
import { postActions, putActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import useFetch from '../../utils/hooks/useFetch';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import { useLocation, useNavigate } from 'react-router';
import { HomeOutlined, UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import BackButton from '../../components/common/BackButton/BackButton';
const { Option } = Select;
const { Title } = Typography;

const NewAccount = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
    const [formLoading , setFormLoading] = useState(false);
    const {data , isLoading  , error}= useFetch(endpoints.users.ROLES_LIST);
    const {data : servicesMedicaux , isLoading : servicesMedicauxLoading}= useFetch(endpoints.services_medicaux.LIST);
    const usersRoles = data;
    const usersRolesLoading = isLoading;
    const currentAccount = useLocation().state?.currentAccount || null;
    console.log(currentAccount);
    
    const type = useLocation().state?.type || null;
    const regexCode = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$';

    const save = () => {
        form.validateFields()   
        .then((values) => {
            setFormLoading(true);
            if (currentAccount === null) {
                
                values.perim = "MED";
                postActions(endpoints.users.ADD,values)
                .then((response)=>{
                    if (response && response.data.Created === true) {
                        message.success("Nouveau compte  ajouté avec succès");
                        form.resetFields();
                        navigate(-1);
                    } 
                    else {
                        message.error("Désolé , ce compte existe déjà");
                    }
                })
            }else{
                values.perim = currentAccount.perim ;
                values.new_password = currentAccount.new_password;
                values.password_confirm = currentAccount.password_confirm;
                putActions(`${endpoints.users.UPDATE}/${userConnected.login}`,values)
                .then((response)=>{
                    if (response && response.data.Updated === true) {
                        message.success("Compte mis à jour avec succès");
                    } 
                })
            }
            
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        })
        .finally(()=>{
            setFormLoading(false)
        });
    }

    return(
        <Card>
            <BackButton /> 
            <br />
            <br />
            <Title level={3} > {currentAccount === null ? "Créer un nouveau compte" : "Modifier un compte existant"} </Title>
            <Form
                form={form}
                layout="vertical"
                onFinish={save}
                initialValues={currentAccount}
            >
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item
                            name="username"
                            label="Nom complet"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Input placeholder='Example : Amah KWATCHA' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="login"
                            label="Login"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Input placeholder='Votre login' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item
                            name="emailaddress"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                                {
                                    type : "email" ,
                                    message : "L'information entrée ne correspond pas à un email!"
                                }
                            ]}
                        >
                            <Input placeholder='Votre email' />
                        </Form.Item>
                    </Col>

                    {/* <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            name="perim"
                            label="Champ d'action"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Champ obligatoire',
                            //     },
                            // ]}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                //defaultValue={(type==="personnel-medical"&& "MED")||(type==="personnel-pharmacie"&& "PH")}
                                defaultValue="MED"
                                showSearch
                                placeholder="Champ d'action"
                                optionFilterProp="children" 
                                disabled
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={"MED"} > Service médical </Option>
                                <Option key={2}  value={"PH"} > Pharmacie </Option>
                            </Select>
                        </Form.Item>
                    </Col> */}
                    
                </Row> 

                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            name="profil"
                            label="Rôle"
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
                                placeholder="Rôle"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={usersRolesLoading}
                            >     
                                {
                                    //usersRoles.filter((item)=>item.role_perim  === "MED")
                                    usersRoles.map((item , key)=>(
                                        <Option key={key}  value={item?.role_code} > {item?.role_name} </Option>
                                    ))
                                }
                                    
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            name="pwd_period"
                            label="Validité mot de passe"
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
                                placeholder="Période de validité"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={30} > 30 jours </Option>
                                <Option key={2}  value={60} > 60 jours </Option>
                                <Option key={3}  value={90} > 90 jours </Option>
    
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            name="etat"
                            label="Etat"
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
                                placeholder="Etat"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={true} > Actif </Option>
                                <Option key={2}  value={false} > Bloqué </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            name="code_serv"
                            label="Service"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                }
                            ]}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Service"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={servicesMedicauxLoading}
                            >     
                                {
                                    servicesMedicaux.map((item , key)=>(
                                        <Option key={key}  value={item?.code_service} > {item?.lib_service} </Option>
                                    ))
                                }
                                    
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                
                {
                    currentAccount === null && 
                    <Row gutter={[24,24]}>
                        <Col xs={24} sm={24} md={8} lg={12} xl={12} >
                            <Form.Item
                                name="new_password"
                                label="Mot de passe"
                                help="Le mot de passe doit contenir au moins 8 caractères qui doivent inclure une majuscule, une minuscule, un chiffre et un caractère spécial"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const regex = new RegExp(regexCode);
                                            if (regex.test(value)) {
                                                return Promise.resolve();
                                            }
                                            else{
                                                return Promise.reject(new Error('Ce mot de passe n\'est pas valide'));  
                                            }
                                        },
                                    }),
                                ]}
                                hasFeedback
                            >
                                <Input.Password minLength={8} placeholder='Votre mot de passe'  />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={12} xl={12} >
                            <Form.Item
                                name="password_confirm"
                                label="Confirmation de mot de passe"
                                dependencies={['new_password']}
                                hasFeedback
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                        if (!value || getFieldValue('new_password') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('La confirmation ne correspond pas à votre mot de passe entré'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password minLength={8} placeholder='Confirmer votre mot de passe' />
                            </Form.Item>
                        </Col>
                    </Row> 
                }

                <Divider  orientation="left">Autres informations</Divider>

                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            //name="username"
                            label="Statut"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Champ obligatoire',
                            //     },
                            // ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            //name="username"
                            label="Fonction"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Champ obligatoire',
                            //     },
                            // ]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                        <Form.Item
                            //name=""
                            label="Ancienneté dans la profession"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Champ obligatoire',
                            //     },
                            // ]}
                        >
                            <InputNumber min={0} max={30} placeholder="Années d'expérience" /> 
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6} >
                        <Form.Item
                            //name=""
                            label="Diplome"
                            // rules={[
                            //     {
                            //         required: true,
                            //         message: 'Champ obligatoire',
                            //     },
                            // ]}
                        >
                            <Upload >
                                <Button icon={<UploadOutlined/>}>
                                 Upload
                                </Button>
                            </Upload>
                        </Form.Item>
                    </Col>
                </Row> 

                <FormFooter 
                    onCancel={()=>{navigate(-1)}}
                    htmlType={'submit'}
                    loading={formLoading}
                />

            </Form>
        </Card>
    )
}

export default NewAccount;