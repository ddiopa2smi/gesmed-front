import { Form, Row, Col, Input, InputNumber, Select, DatePicker, Space } from "antd";
import FormFooter from "../../common/FormFooter/FormFooter";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";
const { RangePicker } = DatePicker;

/**
 * Formulaire de recherche multi-critères : un champ par colonne de la liste des patients.
 * Les valeurs saisies sont transmises à onSearch, la recherche est exécutée côté serveur.
 */
function PatientsAdvancedSearch({ setOpen, form, onSearch, onReset, hideSexe }) {
    const [localForm] = Form.useForm();
    const activeForm = form || localForm;
    const { data: listTypePatients, isLoading: listTypePatientsLoading } = useFetch(endpoints.patients.LIST_TYPE);
    const { data: listDepartements, isLoading: listDepartementsLoading } = useFetch(endpoints.departements.LIST);

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
            <Row gutter={[24, 0]} >
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="num_patient" label="Matricule">
                        <Input placeholder="Entrer un matricule" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="nom_patient" label="Nom">
                        <Input placeholder="Entrer un nom" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="prenom_patient" label="Prénom">
                        <Input placeholder="Entrer un prénom" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="tel_patient" label="Téléphone">
                        <Input placeholder="Entrer un numéro" allowClear />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                    <Form.Item label="Age (min - max)">
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
                                <InputNumber min={0} max={150} placeholder="Max" style={{ width: "50%" }} />
                            </Form.Item>
                        </Space.Compact>
                    </Form.Item>
                </Col>
                {!hideSexe && (
                    <Col xs={24} sm={12} md={8}>
                        <Form.Item name="sexe_patient" label="Sexe">
                            <Select
                                placeholder="Choisir"
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
                    <Form.Item name="type_patient" label="Type">
                        <Select
                            placeholder="Choisir"
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
                <Col xs={24} sm={12} md={8}>
                    <Form.Item name="code_dept" label="Département">
                        <Select
                            placeholder="Choisir"
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
                    <Form.Item name="suspension" label="Etat">
                        <Select
                            placeholder="Choisir"
                            allowClear
                            options={[
                                { value: "A", label: "Actif" },
                                { value: "S", label: "Suspendu" },
                            ]}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={16}>
                    <Form.Item name="date_creation" label="Date de création">
                        <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>
            <FormFooter
                onCancel={() => {
                    activeForm.resetFields();
                    setOpen(false);
                    onReset();
                }}
                htmlType='submit'
                cancelLabel={"Réinitialiser"}
                validLabel={"Rechercher"}
            />
        </Form>
    )
}

export default PatientsAdvancedSearch
