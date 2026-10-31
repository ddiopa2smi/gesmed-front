import { Badge, Button, Col, DatePicker, Flex, Form, Input, InputNumber, Row, Select, Space, theme } from "antd";
import {
    CalendarOutlined, IdcardOutlined, PhoneOutlined, SearchOutlined, TeamOutlined, UndoOutlined, UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";

const { RangePicker } = DatePicker;

// Raccourcis de période pour la date de création
const PRESETS_CREATION = [
    { label: "Aujourd'hui", value: [dayjs().startOf("day"), dayjs().endOf("day")] },
    { label: "7 derniers jours", value: [dayjs().subtract(6, "day").startOf("day"), dayjs().endOf("day")] },
    { label: "Ce mois-ci", value: [dayjs().startOf("month"), dayjs().endOf("month")] },
    { label: "Mois dernier", value: [dayjs().subtract(1, "month").startOf("month"), dayjs().subtract(1, "month").endOf("month")] },
    { label: "Cette année", value: [dayjs().startOf("year"), dayjs().endOf("year")] },
];

// Un critère compte s'il est renseigné (pour une période : les deux bornes)
const estRenseigne = (valeur) => {
    if (valeur === undefined || valeur === null || valeur === "") return false;
    if (Array.isArray(valeur)) return valeur.length === 2 && !!valeur[0] && !!valeur[1];
    return true;
};

const SectionTitle = ({ icon, children }) => {
    const { token: { colorPrimary } } = theme.useToken();
    return (
        <Flex align="center" gap={8} style={{ margin: "4px 0 10px", color: colorPrimary, fontWeight: 600 }}>
            {icon}
            <span>{children}</span>
        </Flex>
    );
};

/**
 * Formulaire de recherche multi-critères : un champ par colonne de la liste des patients.
 * Les valeurs saisies sont transmises à onSearch, la recherche est exécutée côté serveur.
 */
function PatientsAdvancedSearch({ setOpen, form, onSearch, onReset, hideSexe }) {
    const [localForm] = Form.useForm();
    const activeForm = form || localForm;
    const { token: { colorBorderSecondary } } = theme.useToken();
    const { data: listTypePatients, isLoading: listTypePatientsLoading } = useFetch(endpoints.patients.LIST_TYPE);
    const { data: listDepartements, isLoading: listDepartementsLoading } = useFetch(endpoints.departements.LIST);

    // Nombre de critères renseignés, affiché sur le bouton de recherche
    const valeurs = Form.useWatch([], activeForm) || {};
    const nbCriteres = Object.values(valeurs).filter(estRenseigne).length;

    return (
        <Form
            form={activeForm}
            layout="vertical"
            name="search_form"
            onFinish={(values) => {
                onSearch(values);
                setOpen(false);
            }}
        >
            <SectionTitle icon={<UserOutlined />}>Identité</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item name="num_patient" label="Matricule">
                        <Input prefix={<IdcardOutlined />} placeholder="Ex : 140-203515-1" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item name="nom_patient" label="Nom">
                        <Input placeholder="Nom de famille" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item name="prenom_patient" label="Prénom">
                        <Input placeholder="Prénom" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Form.Item name="tel_patient" label="Téléphone">
                        <Input prefix={<PhoneOutlined />} placeholder="Numéro" allowClear />
                    </Form.Item>
                </Col>
            </Row>

            <SectionTitle icon={<TeamOutlined />}>Profil</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Âge (min – max)">
                        <Space.Compact style={{ width: "100%" }}>
                            <Form.Item name="age_min" noStyle>
                                <InputNumber min={0} max={150} placeholder="Min" style={{ width: "50%" }} />
                            </Form.Item>
                            <Form.Item
                                name="age_max"
                                noStyle
                                dependencies={["age_min"]}
                                rules={[
                                    ({ getFieldValue }) => ({
                                        validator(_, value) {
                                            const min = getFieldValue("age_min");
                                            if (value == null || min == null || value >= min) {
                                                return Promise.resolve();
                                            }
                                            return Promise.reject(new Error("L'âge max doit être supérieur ou égal à l'âge min"));
                                        },
                                    }),
                                ]}
                            >
                                <InputNumber min={0} max={150} placeholder="Max" style={{ width: "50%" }} addonAfter="ans" />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Col>
                {!hideSexe && (
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="sexe_patient" label="Sexe">
                            <Select
                                placeholder="Tous"
                                allowClear
                                options={[
                                    { value: "MA", label: "Masculin" },
                                    { value: "FE", label: "Féminin" },
                                ]}
                            />
                        </Form.Item>
                    </Col>
                )}
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="type_patient" label="Type de patient">
                        <Select
                            placeholder="Tous"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={listTypePatientsLoading}
                            options={(listTypePatients || []).map((item) => ({
                                value: item.code_patient,
                                label: item.type_patient,
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={hideSexe ? 8 : 16}>
                    <Form.Item name="code_dept" label="Département / service">
                        <Select
                            placeholder="Tous"
                            allowClear
                            showSearch
                            optionFilterProp="label"
                            loading={listDepartementsLoading}
                            options={(listDepartements || []).map((item) => ({
                                value: item.code_dept,
                                label: item.lib_dept,
                            }))}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="suspension" label="État">
                        <Select
                            placeholder="Tous"
                            allowClear
                            options={[
                                { value: "A", label: "Actif" },
                                { value: "S", label: "Suspendu" },
                            ]}
                        />
                    </Form.Item>
                </Col>
            </Row>

            <SectionTitle icon={<CalendarOutlined />}>Création du dossier</SectionTitle>
            <Row gutter={16}>
                <Col xs={24} md={12}>
                    <Form.Item name="date_creation" label="Créé entre le">
                        <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" presets={PRESETS_CREATION} />
                    </Form.Item>
                </Col>
            </Row>

            <Flex
                justify="space-between"
                align="center"
                wrap
                gap={8}
                style={{ paddingTop: 12, borderTop: `1px solid ${colorBorderSecondary}` }}
            >
                <Button
                    type="text"
                    danger
                    icon={<UndoOutlined />}
                    disabled={nbCriteres === 0}
                    onClick={() => {
                        activeForm.resetFields();
                        setOpen(false);
                        onReset();
                    }}
                >
                    Réinitialiser
                </Button>
                <Space>
                    <Button onClick={() => setOpen(false)}>Fermer</Button>
                    <Badge count={nbCriteres} size="small" offset={[-4, 2]}>
                        <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                            Rechercher
                        </Button>
                    </Badge>
                </Space>
            </Flex>
        </Form>
    )
}

export default PatientsAdvancedSearch
