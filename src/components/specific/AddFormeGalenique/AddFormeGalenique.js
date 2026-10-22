import { Col, Form, Input, Row, Switch, message } from 'antd';
import { useState } from 'react';
import { postActions , putActions } from '../../../actions/actions';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';

// Les formes gérées ici sont toujours des unités de prise
const TYPE_FORME = "UNITE_PRISE";

const AddFormeGalenique = ({
    operationType ,
    setOpen ,
    currentRecord ,
    onRefresh ,

}) => {
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setLoading(true);
            const payload = {
                libelle_forme: values.libelle_forme,
                symbole: values.symbole || null,
                type: TYPE_FORME,
                actif: values.actif ?? true,
            };
            switch (operationType) {
                case "add":
                        postActions(endpoints.forme_galenique.ADD,payload)
                        .then((response)=>{
                            if (response?.data /*?.Added**/) {
                                message.success("Enregistrement effectué avec succès");
                                form.resetFields();
                                setOpen(false);
                                onRefresh();
                            }
                        })
                        .finally(()=>{
                            setLoading(false)
                        })

                    break;
                case "update":
                    // Le code est généré côté serveur à l'ajout ; il identifie la ligne à modifier
                    payload.code_forme = currentRecord?.code_forme;
                    putActions(endpoints.forme_galenique.UPDATE,payload)
                    .then((response)=>{
                        if (response?.data) {
                            message.success("Modification effectuée avec succès");
                            form.resetFields();
                            setOpen(false);
                            onRefresh();
                        }
                    })
                    .finally(()=>{
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


    return(
        <Form
            form={form}
            layout="vertical"
            initialValues={operationType === "update" ? currentRecord : { actif: true }}
            onFinish={save}
            preserve={operationType !== "update"}
        >
            <Row gutter={[24,0]}>
                <Col xs={24}>
                    <Form.Item
                        name="libelle_forme"
                        label="Libellé"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}

                    >
                        <Input placeholder="Ex: Comprimé" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={16}>
                    <Form.Item name="symbole" label="Symbole">
                        <Input placeholder="Ex: cp" />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={8}>
                    <Form.Item name="actif" label="Actif" valuePropName="checked">
                        <Switch checkedChildren="Oui" unCheckedChildren="Non" />
                    </Form.Item>
                </Col>
            </Row>


            <FormFooter
                onCancel={()=>{setOpen(false)}}
                loading={loading}
                htmlType='submit'
            />

        </Form>
    )
}

export default AddFormeGalenique;
