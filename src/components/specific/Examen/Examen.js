import { Col, Form, Radio, Row, Typography, Card, InputNumber, Checkbox, message,Divider } from 'antd';
import { useEffect, useState } from 'react';
import { postActions } from '../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';

const {Text} = Typography;

function Examen({ setOpen , currentRecord , defaultExamPayload , onRefresh}) {
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);
    const [isImcAlertVisible , setIsImcAlertVisible] = useState(false);
    const [imcAlert , setImcAlert] = useState("");
    
    
    const imcAlertMessage = (imc) => {
        if (imc<18.5) {
            setIsImcAlertVisible(true);
            setImcAlert("Insuffisance pondérale (maigreur)");
        }
        else if (imc>= 18.5 && imc< 25) {
            setIsImcAlertVisible(true);
            setImcAlert("Corpulence normale");
        }
        else if (imc>= 25 && imc< 30) {
            setIsImcAlertVisible(true);
            setImcAlert("Surpoids");
        }
        else if (imc>= 30 && imc< 35) {
            setIsImcAlertVisible(true);
            setImcAlert("Obésité modérée");
        }
        else if (imc>= 35 && imc< 40) {
            setIsImcAlertVisible(true);
            setImcAlert("Obésité sévère");
        }
        else if (imc >= 40) {
            setIsImcAlertVisible(true);
            setImcAlert("Obésité morbide ou massive");
        } 
    }

    const transformArrToString = (arr) => {
        let result = "";
        for (let i = 0; i < arr.length; i++) {
            const element = arr[i];
            if (i === 0) {
                result += element
            }else {
                result += "-"+element
            }
        }
        return result;
    }
    const saveExamen = () => {
        form
        .validateFields()
        .then((values) => {
            setLoading(true);
            const payload = { ...defaultExamPayload , ...values} ;
            payload.numpat = currentRecord.num_patient ;
            payload.numrv = currentRecord.num_ordre;
            payload.muqueuse = payload.muqueuse !== null ? transformArrToString(payload.muqueuse) : payload.muqueuse
            payload.zone_oedemes = payload.zone_oedemes !== null ? transformArrToString(payload.zone_oedemes) : payload.zone_oedemes
            console.log(payload)
            postActions(endpoints.consultations.SAVE,payload)   
            .then((response)=>{
                if (response?.data?.Saved === true) {
                    message.success("Examen clinique enregistré avec succès");
                    setOpen(false);
                    form.resetFields();
                    onRefresh();
                }
                else {
                    message.error("Une erreur s'est produite, veuillez réessayer!");
                }
                
            })
            .catch((error)=>{
                message.error(error?.message);
                console.log(error);
            })
            .finally(()=>{
                setLoading(false);
            })
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        })
    } 

    useEffect(()=>{
        const transformationFromStringToArray = (chaine,splitSign) => {
            let splitChaine = chaine.split(splitSign)
            if (splitChaine.length > 1) {
                return splitChaine
            }else{
                return chaine
            }
        }

        if (defaultExamPayload.muqueuse !== null || defaultExamPayload.zone_oedemes !== null) {
            form.setFieldValue("muqueuse" , transformationFromStringToArray(defaultExamPayload.muqueuse,'-'))
            form.setFieldValue("zone_oedemes" , transformationFromStringToArray(defaultExamPayload.zone_oedemes,'-'))
        }

        
    },[])

    return (
        <Form
            form={form}
            layout="vertical" 
            initialValues={defaultExamPayload}
            onFinish={saveExamen}
            onValuesChange={(changedValues , allValues)=> {
                if ((allValues.taille && allValues.taille !== 0) && (allValues.poids && allValues.poids !== 0)) {
                    const newValue=(allValues.poids/((allValues.taille/100)*(allValues.taille/100)));
                    allValues.imc = newValue;
                    form.setFieldValue("imc",allValues.imc);
                    imcAlertMessage(allValues.imc);
                } 
            }}
            preserve={false}
        >
            <div>
                {
                    currentRecord !== null &&
                    <>
                        <Row gutter={[24,24]} >
                            <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                                <Text strong> Patient N° {currentRecord.num_patient} - {currentRecord.prenom_patient} {currentRecord.nom_patient}  </Text>
                            </Col>
                        </Row> <br/>
                    </>
                }
                <Card>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                            <Form.Item 
                                label="Tension.A"
                                name="tension" 
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    }
                                ]}
                                initialValue={1}
                            >
                                <InputNumber min={1} type='number' style={{width : "100%"}} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                            <Form.Item 
                                label="Pouls"
                                name="pouls" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'Champ obligatoire',
                                    },
                                ]}
                                initialValue={1}
                            >
                                <InputNumber min={1} type='number'  style={{width : "100%"}} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                            <Form.Item 
                                label="Température en °C"
                                name="temp" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'Champ obligatoire',
                                    },
                                ]}
                                initialValue={1}
                            >
                                <InputNumber min={1} type='number' style={{width : "100%"}} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Taille en cm"
                                name="taille" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'Champ obligatoire',
                                    },
                                ]}
                                initialValue={1}
                            >
                                <InputNumber min={1} type='number' style={{width : "100%"}} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Poids en kg"
                                name="poids" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'Champ obligatoire',
                                    },
                                ]}
                                initialValue={1}
                            >
                                <InputNumber min={1} type='number'  style={{width : "100%"}} />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label={<Text strong >IMC en kg/m<sup>2</sup> </Text>}
                                name="imc" 
                                rules={[
                                    {
                                    required: true,
                                    message: 'Champ obligatoire',
                                    },
                                ]}
                            >
                                <InputNumber min={0}  disabled style={{width : "100%",fontWeight : "bold" , color :"var(--app-color)"}} />
                            </Form.Item>
                        </Col>
                    </Row>
                    {
                        isImcAlertVisible === true &&
                        <Row>
                            <Col xs={24} sm={24} md={24} lg={24} xl={24}  >
                                {/* <Alert message={imcAlert} type='info' /> */}
                                <div style={{width:"100%",borderRadius : "4px",backgroundColor:"var(--app-color)",color : "white" , fontWeight : "bold",fontSize:"18px" , padding : "10px"}} > {imcAlert} </div>
                            </Col>
                        </Row>
                    }

                </Card>
                <br/>
                <Card>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Muqueuses"
                                name="muqueuse" 
                            >
                                <Checkbox.Group options={["Colorés","Pales","Autres"]}/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Oedèmes"
                                name="oedemes" 
                            >
                                <Radio.Group>
                                    <Radio value={true}>Oui</Radio>
                                    <Radio value={false}>Non</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Zones oedèmes"
                                name="zone_oedemes" 
                            >
                                <Checkbox.Group options={["Visage","Membres inf.","Autres"]}/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left" > Urine </Divider>
                    <Row gutter={[12,12]} >
                            <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                                <Form.Item 
                                    label="G"
                                    name={"urine_gl"} 
                                >
                                    <InputNumber min={0} placeholder='G' style={{width : "100%"}}/>
                                </Form.Item> 
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                                <Form.Item 
                                    label="CC"
                                    name={"urine_cc"} 
                                >
                                    <InputNumber min={0} placeholder='CC' style={{width : "100%"}}/>
                                </Form.Item> 
                            </Col>
                            <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                                <Form.Item 
                                    label="ALB"
                                    name={"urine_alb"} 
                                >
                                    <InputNumber min={0} placeholder='ALB' style={{width : "100%"}}/>
                                </Form.Item> 
                            </Col>
                        </Row>
                </Card>
                <br/>
                <Card>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Déshydratation"
                                name="deshydratation" 
                            >
                                <Radio.Group>
                                    <Radio value={true} >Oui</Radio>
                                    <Radio value={false} >Non</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Dénutrition"
                                name="denutrition" 
                            >
                                <Radio.Group>
                                    <Radio value={true}>Oui</Radio>
                                    <Radio value={false}>Non</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={8} xl={8}  >
                            <Form.Item 
                                label="Obésité"
                                name="obesite" 
                            >
                                <Radio.Group>
                                    <Radio value={true}>Oui</Radio>
                                    <Radio value={false}>Non</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Divider orientation="left" > Vision </Divider>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                            <Form.Item 
                                label="VL"
                                name={"vision_l"} 
                            >
                                <InputNumber min={0} placeholder='VL' style={{width : "100%"}}/>
                            </Form.Item> 
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                            <Form.Item 
                                label="VP"
                                name={"vision_p"} 
                            >
                                <InputNumber min={0} placeholder='VP' style={{width : "100%"}}/>
                            </Form.Item> 
                        </Col>
                    </Row>
                </Card>
                <br/>
                <FormFooter 
                    loading={loading}
                    onCancel={()=>{setOpen(false)}}
                    htmlType='submit'
                />
            </div>
        </Form>
    )
}

export default Examen