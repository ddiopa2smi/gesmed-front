import { Col, Form, Input, InputNumber, Row, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { postActions, putActions } from '../../../actions/actions';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';
import useFetch from '../../../utils/hooks/useFetch';
import { TypePrescription } from '../../../utils/types/types.ts';

const { Option } = Select;

const AddActe = ({
    operationType,
    setOpen,
    currentRecord,
    onRefresh,
    typePrescription,

}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const { data: listCategories, isLoading: listCategoriesLoading } = useFetch(
        endpoints.actes.LIST_CATEGORIES
    );

    const expectedCodeSpe = typePrescription === TypePrescription.ANALYSE ? "BIO" : "RAD";
    const filteredCategories = listCategories.filter((item) => item?.code_spe === expectedCodeSpe);

    // Le record retourné par la liste des actes porte le libellé de la catégorie ("BILAN RENAL"),
    // pas son code (code_categ) attendu par le Select. On le retrouve une fois la liste chargée.
    useEffect(() => {
        if (currentRecord && filteredCategories.length > 0) {
            const matched = filteredCategories.find((item) => item.categorie === currentRecord.categorie);
            if (matched) {
                form.setFieldValue('categorie', matched.code_categ);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRecord, filteredCategories.length]);

    const save = () => {
        form
            .validateFields()
            .then((values) => {
                values.tarif = values.tarif ?? 0;
                setLoading(true);
                switch (operationType) {
                    case "add":
                        postActions(endpoints.actes.ADD(expectedCodeSpe), values)
                            .then((response) => {
                                if (response?.data) {
                                    setLoading(false)
                                    message.success("Enregistrement effectué avec succès");
                                    onRefresh();
                                    form.resetFields();
                                    setOpen(false);
                                }
                            })
                            .finally(() => {
                                setLoading(false);
                            })
                        break;
                    case "update":
                        values.codeacte = currentRecord?.codeacte;
                        putActions(endpoints.actes.UPDATE, values)
                            .then((response) => {
                                if (response?.data) {
                                    setLoading(false);
                                    message.success("Modification effectuée avec succès");
                                    setOpen(false);
                                    onRefresh();
                                    form.resetFields();
                                }
                            })
                            .finally(() => {
                                setLoading(false);
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


    return (
        <Form
            form={form}
            layout="vertical"
            initialValues={currentRecord}
            onFinish={save}
            preserve={operationType === "update" ? false : true}
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="libacte"
                        label="Libellé"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}

                    >
                        <Input />
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item
                name="categorie"
                label="Catégorie"
                rules={[
                    {
                        required: true,
                        message: "Sélection obligatoire",
                    },
                ]}
            >
                <Select
                    style={{ width: "100%", background: "transparent" }}
                    showSearch
                    placeholder="Catégorie"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        option.children.toLowerCase().includes(input.toLowerCase())
                    }
                    loading={listCategoriesLoading}
                >
                    {filteredCategories
                        .map(
                            (
                                item,
                                key
                            ) => (
                                <Option key={key} value={item.code_categ}>
                                    {item.categorie}
                                </Option>
                            )
                        )}
                </Select>
            </Form.Item>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="tarif"
                        label="Tarif"


                    >
                        <InputNumber defaultValue={0} min={0} />
                    </Form.Item>
                </Col>
            </Row>


            <FormFooter
                onCancel={() => { setOpen(false) }}
                loading={loading}
                htmlType='submit'
            />

        </Form>
    )
}

export default AddActe;
