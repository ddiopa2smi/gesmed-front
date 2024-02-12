import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { Avatar, Button, Card , Col, Divider, Flex, Form, Input, Row, Space, Tag, Tooltip, Typography, message } from 'antd'
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import { putActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import ChangePassword from '../../components/specific/ChangePassword/ChangePassword';

const { Title} = Typography;
const {TextArea} = Input;
function Profil() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const [loading,setLoading]= useState(false);
    const [disabled , setDisabled] = useState(true);

    const onFinish = () => {
        setLoading(true);
        form
        .validateFields()
        .then((values) => {
            const payload = {...userConnected , ...values};
            putActions(`${endpoints.users.UPDATE}/${userConnected.login}`,payload)
            .then((response)=>{
                console.log(response.data);
                if (response.data.Updated === true) {
                    message.success("Les informations du profil mises à jour avec succès")
                    sessionStorage.setItem("userConnected",JSON.stringify(payload));
                    form.setFieldsValue(payload);
                    setLoading(false);
                    setDisabled(true);
                }
            })
             
        })
        .catch((info) => {
            setLoading(false);
            console.log('Validate Failed:', info);
        });
    }
    
    return (
        <Card>
                
            
            {/* <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}} >
                
                <div>
                    <Button type='link' onClick={()=>{navigate("/change-password") }} > Mot de passe <LockFilled/></Button> &nbsp;&nbsp;&nbsp;
                    <Button type='primary' disabled={!disabled} onClick={()=>{setDisabled(false)}} > Modifier <EditOutlined/> </Button>
                </div>
            </div> */}
            <Space direction="horizontal" align='center' wrap>
                <Avatar size={{ xs: 32, sm: 32, md: 48, lg: 64, xl: 64}} icon={<UserOutlined/>} />
                <Space direction="horizontal" align='center' wrap>
                    {/* <Text style={{fontSize:32}} strong >  {userConnected.username}</Text>   */}
                    <Title level={3} >  {userConnected.username}</Title>  
                    <Tag color="processing">{userConnected.role_name}</Tag>
                </Space>
            </Space>

            <Divider orientation="left">Mes informations</Divider>

            <Flex justify="flex-end" align="center" >
                <Tooltip title="Editer" >
                    <Button type='primary' shape='circle' disabled={!disabled} onClick={()=>{setDisabled(false)}} icon={<EditOutlined/>} /> 
                </Tooltip>
            </Flex>
        
            <Form
                layout='vertical'
                form={form}
                initialValues={userConnected}
                onFinish={onFinish}
            >
                <Row gutter={[24,24]}>

                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Nom d'utilisateur"
                            name="username" 
                        >
                            <Input disabled={disabled} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Login"
                            name="login" 
                        >
                            <Input disabled={disabled}  />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Email"
                            name="emailaddress" 
                        >
                            <Input disabled={disabled} />
                        </Form.Item>
                    </Col>

                </Row>

                <Row gutter={[24,24]}>

                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Description"
                            name="desc" 
                        >
                            <TextArea disabled={disabled} rows={4} />
                        </Form.Item>
                    </Col>

                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Société"
                            name="societe" 
                        >
                            <Input disabled />
                        </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Périm"
                            name="perim" 
                        >
                            <Input disabled={true}  />
                        </Form.Item>
                    </Col>

                </Row>

                {
                    disabled === false &&
                    <>
                        <br/>
                        <FormFooter 
                            loading={loading}
                            htmlType={"submit"}
                            onCancel={()=>{setDisabled(true); form.setFieldsValue(userConnected)}}
                        />
                    </>
                }

            </Form>

            <Divider orientation="left">Mot de passe</Divider>
            <ChangePassword />
            <Divider orientation="left">Mes privilèges</Divider>


        </Card>
    )
}

export default Profil