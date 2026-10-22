import { Col, Form, Input, InputNumber, Row, Select, Button, message } from 'antd';
import { EditOutlined, RollbackOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { postActions, putActions } from '../../../actions/actions';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';
import useFetch from '../../../utils/hooks/useFetch';


const AddConditionnement = ({
    operationType,
    setOpen,
    currentRecord,
    onRefresh,

}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isManualEdit, setIsManualEdit] = useState(false);
    const { data: formesGaleniqueList, isLoading: formesGaleniqueListLoading } = useFetch(endpoints.forme_galenique.LIST);

    const handleToggleManualEdit = () => {
        if (isManualEdit) {
            // Retour en mode auto : on réinitialise les 3 champs et cond_lib
            form.setFieldsValue({ forme: undefined, quantite: 1, unite: undefined, cond_lib: '' });
        }
        setIsManualEdit(prev => !prev);
    };

    const save = () => {
        form
            .validateFields()
            .then((values) => {
                setLoading(true);
                const payload = {
                    cond_lib: values.cond_lib,
                    cond_qte: values.quantite ?? null,
                    cond_code: ""
                };
                switch (operationType) {
                    case "add":
                        postActions(endpoints.conditionnements.ADD, payload)
                            .then((response) => {
                                if (response?.data) {
                                    message.success("Enregistrement effectué avec succès");
                                    form.resetFields();
                                    setOpen(false);
                                    onRefresh();
                                }
                            })
                            .finally(() => {
                                setLoading(false)
                            })
                        break;
                    case "update":
                        payload.cond_code = currentRecord?.cond_code;
                        putActions(endpoints.conditionnements.UPDATE, payload)
                            .then((response) => {
                                if (response?.data) {
                                    message.success("Modification effectuée avec succès");
                                    form.resetFields();
                                    setOpen(false);
                                    onRefresh();
                                }
                            })
                            .finally(() => {
                                setLoading(false)
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
            preserve={operationType !== "update"}
            onValuesChange={(_, allValues) => {
                if (isManualEdit) return;
                const { forme, quantite, unite } = allValues;
                if (forme && quantite && unite) {
                    form.setFieldsValue({ cond_lib: `${forme} de ${quantite} ${unite}` });
                }
            }}
        >
            <Row gutter={[24, 24]}>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="forme"
                        label="Forme"
                        rules={[{ required: !isManualEdit, message: 'Champ obligatoire' }]}
                    >
                        <Select
                            placeholder="Sélectionner"
                            disabled={isManualEdit}
                            showSearch
                            optionFilterProp="children"
                            loading={formesGaleniqueListLoading}
                            allowClear
                        >
                            {(formesGaleniqueList || [])
                                .filter((item) => item?.type === "CONDITIONNEMENT")
                                .map((item) => (
                                    <Select.Option key={item?.code_forme} value={item?.libelle_forme}>{item?.libelle_forme}</Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="quantite"
                        label="Quantité"
                        initialValue={1}
                        rules={[{ required: !isManualEdit, message: 'Champ obligatoire' }]}
                    >
                        <InputNumber min={1} style={{ width: '100%' }} disabled={isManualEdit} />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                    <Form.Item
                        name="unite"
                        label="Unité"
                        rules={[{ required: !isManualEdit, message: 'Champ obligatoire' }]}
                    >
                        <Select
                            placeholder="Sélectionner"
                            disabled={isManualEdit}
                            showSearch
                            optionFilterProp="children"
                            loading={formesGaleniqueListLoading}
                            allowClear
                        >
                            {(formesGaleniqueList || [])
                                .filter((item) => ["MASSE", "VOLUME", "UNITE_PRISE"].includes(item?.type))
                                .map((item) => (
                                    <Select.Option key={item?.code_forme} value={item?.symbole}>{`${item?.libelle_forme} (${item?.symbole})`}</Select.Option>
                                ))}
                        </Select>
                    </Form.Item>
                </Col>

                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="cond_lib"
                        label="Libellé"
                        rules={[{ required: true, message: 'Champ obligatoire' }]}
                    >
                        <Input
                            size="large"
                            placeholder="Libellé généré à partir de la forme, la quantité et l'unité"
                            readOnly={!isManualEdit}
                            style={{
                                fontSize: 16,
                                fontWeight: 600,
                                backgroundColor: isManualEdit ? undefined : "rgba(0, 0, 0, 0.02)",
                            }}
                            suffix={
                                <Button
                                    type="text"
                                    size="small"
                                    icon={isManualEdit ? <RollbackOutlined /> : <EditOutlined />}
                                    onClick={handleToggleManualEdit}
                                    title={isManualEdit ? 'Revenir au mode automatique' : 'Éditer manuellement'}
                                />
                            }
                        />
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

export default AddConditionnement;
