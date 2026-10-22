import React, { useState } from 'react'
import { Avatar, Button, Card, Col, Flex, Form, Input, Row, Space, Tag, Typography, message, theme } from 'antd'
import { EditOutlined, IdcardOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { putActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import { LOGO_BROWN } from '../../constants/app.constants';

const { Title } = Typography;
const { TextArea } = Input;

// Initiales affichées dans l'avatar (ex : "Kadialy SAMBOU" -> "KS")
const getInitials = (name) =>
    (name || "")
        .replace(/^dr\.?\s+/i, "")
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("");

function Profil() {
    const [form] = Form.useForm();
    const { token: { colorPrimary, colorTextSecondary, colorBorderSecondary } } = theme.useToken();
    const [userConnected, setUserConnected] = useState(JSON.parse(sessionStorage.getItem("userConnected")));
    const [loading, setLoading] = useState(false);
    const [disabled, setDisabled] = useState(true);

    const onFinish = () => {
        setLoading(true);
        form
            .validateFields()
            .then((values) => {
                const payload = { ...userConnected, ...values };
                putActions(`${endpoints.users.UPDATE}/${userConnected.login}`, payload)
                    .then((response) => {
                        if (response.data.Updated === true) {
                            message.success("Les informations du profil mises à jour avec succès")
                            sessionStorage.setItem("userConnected", JSON.stringify(payload));
                            setUserConnected(payload);
                            form.setFieldsValue(payload);
                            setDisabled(true);
                        }
                    })
                    .finally(() => {
                        setLoading(false);
                    })
            })
            .catch((info) => {
                setLoading(false);
                console.log('Validate Failed:', info);
            });
    }

    const initials = getInitials(userConnected?.username);

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Card
                styles={{ body: { padding: 0 } }}
                style={{ overflow: "hidden" }}
            >
                <div
                    style={{
                        height: 110,
                        background: `linear-gradient(120deg, ${colorPrimary} 0%, ${LOGO_BROWN} 100%)`,
                    }}
                />
                <Flex
                    wrap
                    align="flex-end"
                    gap={20}
                    style={{ padding: "0 24px 20px", marginTop: -48 }}
                >
                    <Avatar
                        size={96}
                        icon={!initials && <UserOutlined />}
                        style={{
                            backgroundColor: colorPrimary,
                            fontSize: 34,
                            fontWeight: 600,
                            border: "4px solid #fff",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.12)",
                        }}
                    >
                        {initials}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <Flex align="center" gap={10} wrap>
                            <Title level={3} style={{ margin: 0 }}>{userConnected?.username}</Title>
                            {userConnected?.role_name && <Tag color="processing">{userConnected.role_name}</Tag>}
                        </Flex>
                        <Space size="large" wrap style={{ marginTop: 6, color: colorTextSecondary }}>
                            <span><IdcardOutlined /> {userConnected?.login}</span>
                            {userConnected?.emailaddress && <span><MailOutlined /> {userConnected.emailaddress}</span>}
                        </Space>
                    </div>
                </Flex>
            </Card>

            <Card
                title={<Title level={5} style={{ margin: 0, color: LOGO_BROWN }}>Mes informations</Title>}
                extra={
                    disabled && (
                        <Button icon={<EditOutlined />} onClick={() => setDisabled(false)}>
                            Modifier
                        </Button>
                    )
                }
                styles={{ header: { borderBottom: `1px solid ${colorBorderSecondary}` } }}
            >
                <Form
                    layout='vertical'
                    form={form}
                    initialValues={userConnected}
                    onFinish={onFinish}
                    disabled={disabled}
                >
                    <Row gutter={[24, 0]}>
                        <Col xs={24} md={8}>
                            <Form.Item label="Nom d'utilisateur" name="username">
                                <Input prefix={<UserOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Login" name="login">
                                <Input prefix={<IdcardOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} md={8}>
                            <Form.Item label="Email" name="emailaddress">
                                <Input prefix={<MailOutlined />} />
                            </Form.Item>
                        </Col>
                        <Col xs={24}>
                            <Form.Item label="Description" name="desc">
                                <TextArea rows={3} placeholder="Quelques mots sur vous" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {
                        disabled === false &&
                        <FormFooter
                            loading={loading}
                            htmlType={"submit"}
                            onCancel={() => { setDisabled(true); form.setFieldsValue(userConnected) }}
                        />
                    }
                </Form>
            </Card>
        </Space>
    )
}

export default Profil
