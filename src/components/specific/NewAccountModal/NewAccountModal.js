import React, { useEffect, useState } from 'react';
import { Button, Col, Flex, Form, Input, Modal, Progress, Radio, Row, Select, Space, Tooltip, Typography, message, theme } from 'antd';
import {
    CheckCircleFilled, CloseCircleFilled, CloseOutlined, IdcardOutlined, LockOutlined, MailOutlined, SafetyOutlined,
    SaveOutlined, TeamOutlined, ThunderboltOutlined, UserAddOutlined, UserOutlined, EditOutlined,
} from '@ant-design/icons';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import { postActions, putActions } from '../../../actions/actions';

const { Text } = Typography;

// Règles du mot de passe (même exigence que regexCode)
const REGLES_MOT_DE_PASSE = [
    { label: "8 caractères minimum", test: (v) => v.length >= 8 },
    { label: "Une majuscule", test: (v) => /[A-Z]/.test(v) },
    { label: "Une minuscule", test: (v) => /[a-z]/.test(v) },
    { label: "Un chiffre", test: (v) => /[0-9]/.test(v) },
    { label: "Un caractère spécial (#?!@$%^&*-)", test: (v) => /[#?!@$%^&*-]/.test(v) },
];

// Entier aléatoire dans [0, max) via le générateur cryptographique du navigateur
const aleatoire = (max) => {
    const tableau = new Uint32Array(1);
    window.crypto.getRandomValues(tableau);
    return tableau[0] % max;
};

// Mot de passe aléatoire de 12 caractères respectant toutes les règles
// (caractères ambigus exclus : I, l, O, 0, 1)
const genererMotDePasse = () => {
    const jeux = ["ABCDEFGHJKLMNPQRSTUVWXYZ", "abcdefghijkmnopqrstuvwxyz", "23456789", "#?!@$%&*-"];
    const tirer = (chaine) => chaine[aleatoire(chaine.length)];
    const caracteres = [...jeux.map(tirer), ...Array.from({ length: 8 }, () => tirer(jeux.join("")))];
    // Mélange de Fisher-Yates
    for (let i = caracteres.length - 1; i > 0; i--) {
        const j = aleatoire(i + 1);
        [caracteres[i], caracteres[j]] = [caracteres[j], caracteres[i]];
    }
    return caracteres.join("");
};

// Valeurs d'un nouveau compte (fixes : servent de base à resetFields)
const VALEURS_PAR_DEFAUT = { etat: true, pwd_period: 90 };

const SectionTitle = ({ icon, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Flex align="center" gap={8} style={{ margin: "4px 0 12px", color: colorPrimary, fontWeight: 600 }}>
            {icon}
            <span>{children}</span>
        </Flex>
    );
};

function NewAccountModal({ open, currentRecord, refresh, onCancel }) {
    const [form] = Form.useForm();
    const { token: { colorSuccess, colorTextQuaternary, colorBorderSecondary, colorFillAlter, colorPrimary } } = theme.useToken();
    const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
    const [formLoading, setFormLoading] = useState(false);
    const { data: usersRoles, isLoading: usersRolesLoading } = useFetch(endpoints.users.ROLES_LIST);
    const { data: servicesMedicaux, isLoading: servicesMedicauxLoading } = useFetch(endpoints.services_medicaux.LIST);

    const isCreation = currentRecord === null || currentRecord === undefined;

    const selectedProfil = Form.useWatch('profil', form);
    const selectedRole = (usersRoles || []).find((item) => item?.role_code === selectedProfil);
    const isCodeIpmVisible = selectedRole && /infirmier|m[ée]decin/i.test(selectedRole.role_name || "");

    const motDePasse = Form.useWatch('new_password', form) || "";
    const reglesRespectees = REGLES_MOT_DE_PASSE.filter((regle) => regle.test(motDePasse)).length;

    const regexCode = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$';

    // À chaque ouverture : on repart des valeurs par défaut, puis on charge le compte édité s'il y en a un.
    // (resetFields revient aux initialValues : elles doivent rester fixes, sinon un "Nouveau compte"
    // ouvert après une édition reprendrait les informations du dernier compte consulté)
    useEffect(() => {
        if (open) {
            form.resetFields();
            if (currentRecord) {
                form.setFieldsValue(currentRecord);
            }
        }
    }, [open, currentRecord, form]);

    const save = () => {
        form.validateFields()
            .then((values) => {
                setFormLoading(true);
                if (isCreation) {
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

    const remplirMotDePasseGenere = () => {
        const genere = genererMotDePasse();
        form.setFieldsValue({ new_password: genere, password_confirm: genere });
        form.validateFields(['new_password', 'password_confirm']);
        navigator.clipboard?.writeText(genere).then(
            () => message.success("Mot de passe généré et copié dans le presse-papiers"),
            () => message.success("Mot de passe généré"),
        );
    };

    return (
        <Modal
            open={open}
            style={{ top: 20 }}
            title={
                <Space>
                    {isCreation ? <UserAddOutlined style={{ color: colorPrimary }} /> : <EditOutlined style={{ color: colorPrimary }} />}
                    <span>{isCreation ? "Créer un nouveau compte" : `Modifier le compte ${currentRecord?.login || ""}`}</span>
                </Space>
            }
            onCancel={onCancel}
            footer={null}
            width={920}
            destroyOnClose
            maskClosable={false}
            keyboard={false}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={save}
                initialValues={VALEURS_PAR_DEFAUT}
            >
                <SectionTitle icon={<UserOutlined />}>Identité</SectionTitle>
                <Row gutter={16}>
                    <Col xs={24} md={8}>
                        <Form.Item name="username" label="Nom complet" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                            <Input prefix={<UserOutlined />} placeholder='Ex : Amah KWATCHA' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="login"
                            label="Login"
                            rules={[{ required: true, message: 'Champ obligatoire' }]}
                            tooltip={!isCreation ? "Le login ne peut pas être modifié" : undefined}
                        >
                            <Input prefix={<IdcardOutlined />} placeholder='Identifiant de connexion' disabled={!isCreation} autoComplete="off" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                        <Form.Item
                            name="emailaddress"
                            label="Email"
                            rules={[
                                { required: true, message: 'Champ obligatoire' },
                                { type: "email", message: "L'information entrée ne correspond pas à un email !" },
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder='nom@exemple.com' />
                        </Form.Item>
                    </Col>
                </Row>

                <SectionTitle icon={<TeamOutlined />}>Rôle et service</SectionTitle>
                <Row gutter={16}>
                    <Col xs={24} md={isCodeIpmVisible ? 8 : 12}>
                        <Form.Item name="profil" label="Rôle" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                            <Select
                                showSearch
                                placeholder="Choisir le rôle"
                                optionFilterProp="label"
                                loading={usersRolesLoading}
                                options={(usersRoles || []).map((item) => ({ value: item?.role_code, label: item?.role_name }))}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={isCodeIpmVisible ? 8 : 12}>
                        <Form.Item name="code_serv" label="Service">
                            <Select
                                allowClear
                                showSearch
                                placeholder="Choisir le service"
                                optionFilterProp="label"
                                loading={servicesMedicauxLoading}
                                options={(servicesMedicaux || []).map((item) => ({ value: item?.code_service, label: item?.lib_service }))}
                            />
                        </Form.Item>
                    </Col>
                    {isCodeIpmVisible && (
                        <Col xs={24} md={8}>
                            <Form.Item
                                name="code_ipm"
                                label="Code IPM"
                                tooltip="Correspond au numéro fournisseur de la base IPM (médecins et infirmiers)"
                            >
                                <Input placeholder='Numéro fournisseur IPM' />
                            </Form.Item>
                        </Col>
                    )}
                </Row>

                <SectionTitle icon={<SafetyOutlined />}>Sécurité</SectionTitle>
                <Row gutter={16}>
                    <Col xs={24} md={12}>
                        <Form.Item name="etat" label="État du compte" rules={[{ required: true, message: 'Champ obligatoire' }]}>
                            <Radio.Group
                                optionType="button"
                                buttonStyle="solid"
                                style={{ display: "flex" }}
                                options={[
                                    { label: "Actif", value: true, style: { flex: 1, textAlign: "center" } },
                                    { label: "Bloqué", value: false, style: { flex: 1, textAlign: "center" } },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                        <Form.Item
                            name="pwd_period"
                            label="Validité du mot de passe"
                            tooltip="Au-delà de cette durée, l'utilisateur devra changer son mot de passe"
                            rules={[{ required: true, message: 'Champ obligatoire' }]}
                        >
                            <Radio.Group
                                optionType="button"
                                buttonStyle="solid"
                                style={{ display: "flex" }}
                                options={[30, 60, 90].map((jours) => ({ label: `${jours} jours`, value: jours, style: { flex: 1, textAlign: "center" } }))}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {isCreation && (
                    <div style={{ padding: "12px 14px 0", borderRadius: 10, background: colorFillAlter, marginBottom: 16 }}>
                        <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
                            <Text strong><LockOutlined /> Mot de passe initial</Text>
                            <Tooltip title="Générer un mot de passe conforme (copié dans le presse-papiers)">
                                <Button size="small" icon={<ThunderboltOutlined />} onClick={remplirMotDePasseGenere}>
                                    Générer
                                </Button>
                            </Tooltip>
                        </Flex>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="new_password"
                                    label="Mot de passe"
                                    rules={[
                                        { required: true, message: 'Champ obligatoire' },
                                        () => ({
                                            validator(_, value) {
                                                const regex = new RegExp(regexCode);
                                                if (!value || regex.test(value)) {
                                                    return Promise.resolve();
                                                }
                                                return Promise.reject(new Error('Ce mot de passe ne respecte pas les règles ci-dessous'));
                                            },
                                        }),
                                    ]}
                                    hasFeedback
                                >
                                    <Input.Password minLength={8} placeholder='Mot de passe' autoComplete="new-password" />
                                </Form.Item>
                            </Col>
                            <Col xs={24} md={12}>
                                <Form.Item
                                    name="password_confirm"
                                    label="Confirmation du mot de passe"
                                    dependencies={['new_password']}
                                    hasFeedback
                                    rules={[
                                        { required: true, message: 'Champ obligatoire' },
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
                                    <Input.Password minLength={8} placeholder='Saisir à nouveau le mot de passe' autoComplete="new-password" />
                                </Form.Item>
                            </Col>
                        </Row>

                        {/* Règles cochées au fil de la saisie */}
                        <Progress
                            percent={(reglesRespectees / REGLES_MOT_DE_PASSE.length) * 100}
                            showInfo={false}
                            size="small"
                            strokeColor={reglesRespectees === REGLES_MOT_DE_PASSE.length ? colorSuccess : undefined}
                            style={{ marginBottom: 6 }}
                        />
                        <Flex wrap gap="4px 16px" style={{ paddingBottom: 12 }}>
                            {REGLES_MOT_DE_PASSE.map((regle) => {
                                const ok = regle.test(motDePasse);
                                return (
                                    <Text key={regle.label} style={{ fontSize: 12, color: ok ? colorSuccess : undefined }} type={ok ? undefined : "secondary"}>
                                        {ok
                                            ? <CheckCircleFilled style={{ marginRight: 4 }} />
                                            : <CloseCircleFilled style={{ marginRight: 4, color: colorTextQuaternary }} />}
                                        {regle.label}
                                    </Text>
                                );
                            })}
                        </Flex>
                    </div>
                )}

                <Flex
                    justify="flex-end"
                    style={{ paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
                >
                    <Space>
                        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={formLoading}>
                            {isCreation ? "Créer le compte" : "Enregistrer les modifications"}
                        </Button>
                        <Button danger icon={<CloseOutlined />} onClick={onCancel}>
                            Annuler
                        </Button>
                    </Space>
                </Flex>
            </Form>
        </Modal>
    );
}

export default NewAccountModal;
