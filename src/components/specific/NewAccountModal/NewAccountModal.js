import React, { useEffect, useState } from 'react';
import { Form, Input, Row, Col, Select, message, Modal } from 'antd';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import { postActions, putActions } from '../../../actions/actions';


const { Option } = Select;

function NewAccountModal({ open, currentRecord, refresh, onCancel }) {
    const [form] = Form.useForm();
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const [formLoading, setFormLoading] = useState(false);
    const { data: usersRoles, isLoading: usersRolesLoading } = useFetch(endpoints.users.ROLES_LIST);
    const { data: servicesMedicaux, isLoading: servicesMedicauxLoading } = useFetch(endpoints.services_medicaux.LIST);

    const selectedProfil = Form.useWatch('profil', form);
    const selectedRole = (usersRoles || []).find((item) => item?.role_code === selectedProfil);
    const isCodeIpmVisible = selectedRole && /infirmier|m[ée]decin/i.test(selectedRole.role_name || "");

    const regexCode = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$';

    useEffect(() => {
        if (open) {
            if (currentRecord) {
                form.setFieldsValue(currentRecord);
            } else {
                form.resetFields();
            }
        }
    }, [open, currentRecord, form]);

    const save = () => {
        form.validateFields()
            .then((values) => {
                setFormLoading(true);
                if (currentRecord === null) {
                    values.perim = "MED";
                    postActions(endpoints.users.ADD, values)
                        .then((response) => {
                            if (response && response.data.Created === true) {
                                message.success("Nouveau compte ajouté avec succès");
                                form.resetFields();
                                if (refresh) {
                                    refresh();
                                }
                                if (onCancel) {
                                    onCancel();
                                }
                            } else {
                                message.error("Désolé, ce compte existe déjà");
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Erreur lors de la création du compte");
                        })
                        .finally(() => {
                            setFormLoading(false);
                        });
                } else {
                    values.perim = currentRecord.perim;
                    values.new_password = currentRecord.new_password;
                    values.password_confirm = currentRecord.password_confirm;
                    const targetLogin = currentRecord.login || userConnected?.login;

                    putActions(`${endpoints.users.UPDATE}/${targetLogin}`, values)
                        .then((response) => {
                            if (response && response.data.Updated === true) {
                                message.success("Compte mis à jour avec succès");
                                if (refresh) {
                                    refresh();
                                }
                                if (onCancel) {
                                    onCancel();
                                }
                            } else {
                                message.error("Erreur lors de la mise à jour");
                            }
                        })
                        .catch((err) => {
                            console.error(err);
                            message.error("Erreur lors de la modification du compte");
                        })
                        .finally(() => {
                            setFormLoading(false);
                        });
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            open={open}
            style={{ top: 20 }}
            title={currentRecord === null ? "Créer un nouveau compte" : "Modifier un compte existant"}
            onCancel={onCancel}
            onOk={save}
            confirmLoading={formLoading}
            okText="Enregistrer"
            cancelText="Annuler"
            width={1000}
            destroyOnClose
            maskClosable={false}
            keyboard={false}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={currentRecord || {}}
            >
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
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
                            <Input placeholder='Exemple : Amah KWATCHA' />
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
                            <Input placeholder='Votre login' disabled={currentRecord !== null} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="emailaddress"
                            label="Email"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                                {
                                    type: "email",
                                    message: "L'information entrée ne correspond pas à un email!"
                                }
                            ]}
                        >
                            <Input placeholder='Votre email' />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
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
                                style={{ width: '100%', background: "transparent" }}
                                showSearch
                                placeholder="Rôle"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={usersRolesLoading}
                            >
                                {
                                    (usersRoles || []).map((item, key) => (
                                        <Option key={key} value={item?.role_code}> {item?.role_name} </Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
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
                                style={{ width: '100%', background: "transparent" }}
                                showSearch
                                placeholder="Période de validité"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >
                                <Option key={1} value={30}> 30 jours </Option>
                                <Option key={2} value={60}> 60 jours </Option>
                                <Option key={3} value={90}> 90 jours </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
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
                                style={{ width: '100%', background: "transparent" }}
                                showSearch
                                placeholder="Etat"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                            >
                                <Option key={1} value={true}> Actif </Option>
                                <Option key={2} value={false}> Bloqué </Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                        <Form.Item
                            name="code_serv"
                            label="Service"
                            rules={[
                                {
                                    required: false,
                                    message: 'Champ obligatoire',
                                }
                            ]}
                        >
                            <Select
                                style={{ width: '100%', background: "transparent" }}
                                showSearch
                                placeholder="Service"
                                optionFilterProp="children"
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                loading={servicesMedicauxLoading}
                            >
                                {
                                    (servicesMedicaux || []).map((item, key) => (
                                        <Option key={key} value={item?.code_service}> {item?.lib_service} </Option>
                                    ))
                                }
                            </Select>
                        </Form.Item>
                    </Col>
                    {
                        isCodeIpmVisible &&
                        <Col xs={24} sm={24} md={8} lg={6} xl={6}>
                            <Form.Item
                                name="code_ipm"
                                label="Code IPM"
                                help="Correspond au numéro fournisseur de la base IPM"
                            >
                                <Input placeholder='Code IPM' />
                            </Form.Item>
                        </Col>
                    }
                </Row>

                {
                    currentRecord === null &&
                    <Row gutter={[24, 24]}>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="new_password"
                                label="Mot de passe"
                                help="Le mot de passe doit contenir au moins 8 caractères incluant une majuscule, une minuscule, un chiffre et un caractère spécial."
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                    () => ({
                                        validator(_, value) {
                                            const regex = new RegExp(regexCode);
                                            if (!value || regex.test(value)) {
                                                return Promise.resolve();
                                            } else {
                                                return Promise.reject(new Error('Ce mot de passe n\'est pas valide'));
                                            }
                                        },
                                    }),
                                ]}
                                hasFeedback
                            >
                                <Input.Password minLength={8} placeholder='Votre mot de passe' />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="password_confirm"
                                label="Confirmation du mot de passe"
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
                                            return Promise.reject(new Error('La confirmation ne correspond pas au mot de passe entré'));
                                        },
                                    }),
                                ]}
                            >
                                <Input.Password minLength={8} placeholder='Confirmer votre mot de passe' />
                            </Form.Item>
                        </Col>
                    </Row>
                }
            </Form>
        </Modal>
    );
}

export default NewAccountModal;
