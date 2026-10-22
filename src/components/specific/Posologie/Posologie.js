import { Col, Form, Input, Radio, Row, Select, Space, Card, Checkbox, InputNumber, message, Typography, theme } from 'antd';
import FormFooter from "../../common/FormFooter/FormFooter";
import useFetch from "../../../utils/hooks/useFetch";
import { endpoints } from "../../../constants/endpoints.constants";


const { TextArea } = Input;
const { Title } = Typography;
const { Option } = Select;

const Posologie = ({ medicamentsPrescrites, setMedicamentsPrescrites, medicamentSelected, quantity, conditionnement, setIsModalVisible, onValidate }) => {

    const [form] = Form.useForm();
    const { token: { colorPrimary } } = theme.useToken();
    const { data: formesGaleniqueList, isLoading: formesGaleniqueListLoading } = useFetch(endpoints.forme_galenique.LIST);

    const onFinish = () => {
        form
            .validateFields()
            .then((values) => {
                let inc = 0; // increment
                let index = 0;
                const payload = {
                    codeacte: medicamentSelected.code_produit,
                    libacte: medicamentSelected.libelle_produit,
                    posologie: `${values.qte} ${values.forme_galenique} - ${values.qd} ${values.comment === "Aucun" ? "" : `- ${values.comment}`} - pdt ${values.duree} j`,
                    qte: quantity,
                    cond: conditionnement,
                    observation: values.observation
                }

                // Tester l'existence du médicament dans la table des medicaments si oui incrementer inc
                for (let i = 0; i < medicamentsPrescrites.length; i++) {
                    if (medicamentsPrescrites[i].codeacte === medicamentSelected.code_produit) {
                        inc += 1;
                        index = i;
                    }
                }

                // Si le médicament existe alors modifier les valeurs du médicament courant sinon ajouter un autre médicament
                if (inc === 1) {
                    const temp = { ...medicamentsPrescrites[index], ...payload };
                    medicamentsPrescrites[index].codeacte = temp.codeacte;
                    medicamentsPrescrites[index].libacte = temp.libacte;
                    medicamentsPrescrites[index].posologie = temp.posologie;
                    medicamentsPrescrites[index].qte = temp.qte;
                    medicamentsPrescrites[index].cond = temp.cond;
                    medicamentsPrescrites[index].observation = temp.observation;
                    setMedicamentsPrescrites(medicamentsPrescrites);
                    //message.info("Médicament déjà existant et modifié avec succès");
                } else {
                    const temp = medicamentsPrescrites.push(payload);
                    setMedicamentsPrescrites([...medicamentsPrescrites], temp);
                    //message.success("Médicament ajouté dans la liste avec succès");
                }
                form.resetFields();
                setIsModalVisible(false);
                if (onValidate) {
                    onValidate();
                }
            })
            .catch((info) => {
                console.log('Validate Failed:', info);
            });
    }


    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            preserve={false}
        >
            <Title level={5} style={{ color: colorPrimary }}  > {medicamentSelected !== null ? medicamentSelected.libelle_produit : ""} </Title>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item
                        label="Quantité"
                        name="qte"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={1}
                    >
                        <InputNumber min={1} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item
                        label="Forme"
                        name="forme_galenique"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={"comprimé"}
                    >
                        <Select
                            style={{ width: '100%', background: "transparent" }}
                            showSearch
                            placeholder="Forme"
                            optionFilterProp="children"
                            loading={formesGaleniqueListLoading}
                            allowClear
                        >
                            {(formesGaleniqueList || [])
                                .filter((item) => item?.type === "UNITE_PRISE")
                                .map((item) => (
                                    <Option key={item?.code_forme} value={item?.libelle_forme?.toLowerCase()}>{item?.libelle_forme}</Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>
            </Row>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >

                    <Form.Item
                        name="qd"
                        label="Quand"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={["Matin"]}
                    >
                        <Checkbox.Group style={{ display: "flex", flexDirection: "column" }} options={["Matin", "Midi", "Soir", "Au coucher"]} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Radio.Group>
                        <Form.Item
                            name="comment"
                            label="Comment"
                            initialValue={"Aucun"}
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                        >
                            <Space direction="vertical">
                                <Radio value={"Aucun"}>Aucun</Radio>
                                <Radio value={"A jeun"}>A jeun</Radio>
                                <Radio value={"Avant repas"}>Avant repas </Radio>
                                <Radio value={"Après repas"}>Après repas</Radio>
                                <Radio value={"Milieu repas"}>Milieu repas</Radio>
                            </Space>
                        </Form.Item>

                    </Radio.Group>

                </Col>
            </Row>
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item
                        label="Durée traitement en jours"
                        name="duree"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={1}
                    >
                        <InputNumber min={1} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                    <Form.Item
                        label="Observation"
                        name="observation"
                    >
                        <TextArea rows={3} />
                    </Form.Item>
                </Col>
            </Row>


            <FormFooter
                onCancel={() => { setIsModalVisible(false) }}
                htmlType='submit'
                validLabel={"Ajouter"}
            />

        </Form>
    )
}

export default Posologie;