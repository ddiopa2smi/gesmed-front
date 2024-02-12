import { Col, Form, Input, Row, message} from 'antd';
import {useState } from 'react';
import { putActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import { useNavigate } from 'react-router';
import FormFooter from '../../common/FormFooter/FormFooter';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const regexCode = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$'
    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));

    const onFinish = () => {
        setLoading(true);
        form
        .validateFields()
        .then((values) => {
            const payload = {
                login : userConnected.login ,
                new_password : values.new_password,
                new_password_confirm : values.new_password_confirm,
                password : values.password
            }
            putActions(endpoints.users.UPDATE_PASSWORD,payload)
            .then((response)=>{
                if (response.data.status === "OK") {
                    setLoading(false);
                    message.success("Mots de passe mises à jour avec succès");
                    form.resetFields();
                    navigate(-1);
                }else{
                    setLoading(false);
                    message.success("Une erreur s'est produite, veuillez réessayer svp");
                }
            })
        })
        .catch((info) => {
            setLoading(false);
            console.log('Validate Failed:', info);
        });
    }

    return(
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
        >
        
            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Ancien mot de passe"
                        name="password" 
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Nouveau mot de passe"
                        name="new_password" 
                        rules={[
                            {
                                required: true,
                                message: 'Votre nouveau mot de passe svp',
                            },
                            // {
                            //     pattern : new RegExp(regexCode) ,
                            //     type: "regexp",
                            //     message: 'Ce mot de passe n\'est pas valide',
                            // },
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
                        <Input.Password />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                    <Form.Item 
                        label="Confirmation de mot de passe"
                        name="new_password_confirm" 
                        rules={[
                            {
                                required: true,
                                message: 'Confirmez votre mot de passe',
                            },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('new_password') === value) {
                                    return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Les mots de passe ne matchent pas'));
                                },
                            }), 
                        ]}
                        hasFeedback
                    >
                        <Input.Password  />
                    </Form.Item>
                </Col>
            </Row> 
            

            <FormFooter 
                loading={loading}
                htmlType={"submit"}
                onCancel={()=>{form.resetFields()}}
            />
        </Form>
    )
}

export default ChangePassword;