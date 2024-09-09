import { Button, Card, Col, DatePicker, Upload , Divider, Flex, Form, Image, Input, InputNumber, Row, Select, Space, Typography } from 'antd'
import React, { useState } from 'react'
import microscope from "./../../../assets/microscope.png"
import { PlusOutlined } from '@ant-design/icons';
import BackButton from '../../../components/common/BackButton/BackButton';
const {Title , Text} = Typography;
const {TextArea } = Input;
const {Option } = Select;

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
});

function NewPeripheral() {
    const [form] = Form.useForm();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [fileList, setFileList] = useState([
        {
            uid: '-1',
            name: 'image.png',
            status: 'done',
            url: microscope // 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        },
    ]);
    const handlePreview = async (file) => {
        if (!file.url && !file.preview) {
        file.preview = await getBase64(file.originFileObj);
        }
        setPreviewImage(file.url || file.preview);
        setPreviewOpen(true);
    };
    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
    const uploadButton = (
        <button
        style={{
            border: 0,
            background: 'none',
        }}
        type="button"
        >
        <PlusOutlined />
        <div
            style={{
            marginTop: 8,
            }}
        >
            Upload
        </div>
        </button>
    );
    const save = () => {

    }
    return (
        <Card>
            
            <Form
                layout='vertical'
                form={form}
                name="new_peripheral_form"
                onFinish={save}
                style={{margin : "0px 8%"}}
            >
                <div style={{marginBottom : 24}}>
                    <BackButton />
                </div>
                <Flex justify='space-between' align='center' >
                    <Title level={3} > Nouveau périphérique </Title>
                    <Space>
                        <Button type='text' htmlType='reset' > Annuler </Button>
                        <Button type='primary' htmlType='submit' > Enregistrer </Button>
                    </Space>
                </Flex>
                <br/>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={24} md={6} lg={6} xl={6} >
                        <Card size='small' >                        
                            <Image src={microscope} alt='microscope' style={{objectFit : "cover" , borderRadius : 4}} />
                        </Card>
                        <br/>
                        <Row gutter={[8,8]}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                                <Form.Item 
                                    label="Assigné à :"
                                    name="assign_to_room" 
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Champ obligatoire',
                                        },
                                    ]}
                                >
                                    <Input placeholder='Numéro de chambre' />
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={[8,8]}>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                                <Form.Item 
                                    label="Statut"
                                    name="status" 
                                    rules={[
                                        {
                                        required: true,
                                        message: 'Champ obligatoire',
                                        },
                                    ]}
                                >
                                    <Select
                                        size='small'
                                        style={{width:100,background:"transparent"}}
                                        showSearch
                                        placeholder="Statut"
                                        optionFilterProp="children"
                                        filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                                    >     
                                            <Option value='new' > Nouveau </Option>                  
                                            <Option value='used' > Utilisé </Option>                
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={24} sm={24} md={18} lg={18} xl={18} >
                        <Card>
                            <Title level={4} > Détails produit </Title>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Nom du produit"
                                        name="product_name" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Séries(optionnel)"
                                        name="series" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Catégorie"
                                        name="categorie" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input placeholder='Catégorie' />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Poids"
                                        name="poids" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <InputNumber min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="SKU"
                                        name="sku" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Barcode"
                                        name="barcode" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                                    <Form.Item 
                                        label="Description"
                                        name="description" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <TextArea />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider />
                            <Title level={4} > Détails achat </Title>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Date d'achat "
                                        name="purchase_date" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <DatePicker format="DD/MM/YYYY"/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Prix d'achat"
                                        name="purchase_price" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <InputNumber min={0} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={[24,24]}>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Fournisseur"
                                        name="fournisseur" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                                <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                                    <Form.Item 
                                        label="Numéro de facture"
                                        name="invoice_number" 
                                        rules={[
                                            {
                                            required: true,
                                            message: 'Champ obligatoire',
                                            },
                                        ]}
                                    >
                                        <Input/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Divider />
                            <Title level={4} > Attachements </Title>
                            <Text type='secondary' style={{fontSize : 12}} > Veuillez charger des photos de produit, des factures en format jpg ou jpeg </Text>
                            <div>
                                <Upload
                                    action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                                    listType="picture-card"
                                    fileList={fileList}
                                    onPreview={handlePreview}
                                    onChange={handleChange}
                                >
                                    {fileList.length >= 8 ? null : uploadButton}
                                </Upload>
                                {previewImage && (
                                    <Image
                                    wrapperStyle={{
                                        display: 'none',
                                    }}
                                    preview={{
                                        visible: previewOpen,
                                        onVisibleChange: (visible) => setPreviewOpen(visible),
                                        afterOpenChange: (visible) => !visible && setPreviewImage(''),
                                    }}
                                    src={previewImage}
                                    />
                                )}
                            </div>
                        </Card>
                    </Col>
                </Row>

            </Form>
            
        </Card>
    )
}

export default NewPeripheral