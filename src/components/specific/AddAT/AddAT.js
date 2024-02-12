import { Col, Form, Input, Row, Select, Typography, Upload , DatePicker, Card, Calendar, InputNumber, Checkbox, message, Tabs, theme, TimePicker, Divider } from 'antd';
import { useState } from 'react';
import dayjs from 'dayjs'
import FormFooter from '../../common/FormFooter/FormFooter';
const { Search } = Input;
const {TextArea} = Input;
const { Option } = Select;
const { Dragger } = Upload;
const {Title , Text} = Typography;

const AddAT = ({setIsModalVisible , currentRecord, operationType , onRefresh}) => {
    const {token: { colorBgElevated },} = theme.useToken();
    const [form] = Form.useForm();
    //const currentRecord  = JSON.parse(sessionStorage.getItem("currentRecord"));
    const [formLoading , setFormLoading] = useState(false);

    const save = () => {
        form
        .validateFields()
        .then((values) => {
            switch (operationType) {
                case "add":
                    // const payload = {
                    //     num_at,
                    //     date_at,
                    //     matricule,
                    //     prenoms,
                    //     nom,
                    //     datenaiss,
                    //     service,
                    //     emploi,
                    //     jour_semaine,
                    //     lieu_at,
                    //     Horaire_Travail,
                    //     date_declaration,
                    //     num_carnet_at,
                    //     nature_lesions,
                    //     heure_premiers_soins,
                    //     structures_premiers_soins,
                    //     lieu_transport,
                    //     heure_transport,
                    //     structure_transport,
                    //     moyen_transport,
                    //     temoin_vu,
                    //     temoin_entendu,
                    //     temoin_avise,
                    //     sexe,
                    //     lieu_residence,
                    //     circonstances,
                    //     mesures_prises,
                    //     causes_date_prevue,
                    //     causes_avec_qui,
                    //     certicat_medical,
                    //     date_guerison_prevue,
                    //     date_consolidation
                    // }
                    console.log(values);
                        // postActions("/api/smed/DossierAT/list")
                        // .then((response)=>{
                        //     onRefresh();
                        // })
                        console.log(values);
                        setIsModalVisible(false);
                    break;
                case "update":
                        // values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        // values.num_patient = currentRecord ? currentRecord.num_patient : null;
                        // _updatePatient(values);
                        setIsModalVisible(false);
                    break;
                default:
                    break;
            }
            form.resetFields();  
            //onRefresh();  
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }


    const VictimeFields = () => {
        return (
            <div>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="matricule"
                            label="Matricule"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={currentRecord?.matricule || null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="nom"
                            label="Nom"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={(currentRecord && currentRecord.nom)||null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="prenoms"
                            label="Prénom(s)"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={(currentRecord && currentRecord.prenoms)||null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                </Row>

                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="service"
                            label="Service"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={(currentRecord && currentRecord.service)||null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="emploi"
                            label="Emploi"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={(currentRecord && currentRecord.emploi)||null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                        <Form.Item
                            name="lieu_residence"
                            label="Lieu de résidence"
                            rules={[
                                {
                                    required: true,
                                    message: 'Champ obligatoire',
                                },
                            ]}
                            initialValue={(currentRecord && currentRecord.lieu_residence)||null}
                        >
                            <Input/>
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        )
    }

    const Accident = () => {    
        return (
            <div>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Date/Heure Accident"
                            name="date_at" 
                            initialValue={currentRecord?.date_at||null}
                        >
                            <DatePicker placeholder='Sélectionner' showTime  />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Date de déclaration"
                            name="date_declaration" 
                            initialValue={currentRecord?.date_declaration||null}
                        >
                            <DatePicker placeholder='Sélectionner'  format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Jour de la semaine"
                            name="jour_semaine" 
                            initialValue={(currentRecord && currentRecord.jour_semaine)||null}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Jour de la semaine"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                               <Option key={1}  value={"Lundi"} > Lundi </Option>
                               <Option key={2}  value={"Mardi"} > Mardi </Option>
                               <Option key={3}  value={"Mercredi"} > Mercredi </Option>
                               <Option key={4}  value={"Jeudi"} > Jeudi </Option>
                               <Option key={5}  value={"Vendredi"} > Vendredi </Option>
                               <Option key={6}  value={"Samedi"} > Samedi </Option>
                               <Option key={7}  value={"Dimanche"} > Dimanche </Option>
                                    
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Lieu exact"
                            name="lieu_at" 
                            initialValue={(currentRecord && currentRecord.lieu_at)||null}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Lieu exact"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={"Atelier"} > Atelier </Option>
                                <Option key={2}  value={"Poste"} > Poste </Option>
                                <Option key={3}  value={"Champ"} > Champ </Option>
                                <Option key={4}  value={"Trajet Aller"} > Trajet Aller </Option>
                                <Option key={5}  value={"Trajet Retour"} > Trajet Retour </Option>
                                <Option key={6}  value={"Autres"} > Autres </Option>

                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Horaire de travail"
                            name="horaire_travail" 
                            initialValue={(currentRecord && currentRecord.horaire_travail)||null}
                        >
                            <Input placeholder='Horaire de travail' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        {
                            /** num_carner_at : A revoir normalement (le name) en cas de non prise en compte du formulaire */
                        }
                        <Form.Item 
                            label="N° Carnet AT"
                            name="num_carnet_at" 
                            initialValue={(currentRecord && currentRecord.num_carnet_at)||null}
                        >
                            <Input placeholder='N° Carnet AT' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Form.Item 
                            label="Nature et Siège des lésions"
                            name="nature_lesions" 
                            initialValue={(currentRecord && currentRecord.nature_lesions)||null}
                        >
                            <TextArea rows={5} placeholder='Nature et Siège des lésions' />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        )
    }

    const Actions = () => {
        return (
            <div>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Premiers soins</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Heure"
                            name="heure_premiers_soins" 
                            initialValue={(currentRecord && currentRecord.heure_premiers_soins)||null}
                        >
                            <TimePicker placeholder="Entrer l'heure" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Par qui ?"
                            name="parqui" 
                            initialValue={null}
                        >
                            <Input placeholder='Par qui ?' />
                        </Form.Item>
                    </Col>
                </Row>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Transport de la victime</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Où?"
                            name="où" 
                            initialValue={null}
                        >
                            <Input placeholder='Où?' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Heure transport"
                            name="heure_transport" 
                            initialValue={(currentRecord && currentRecord.heure_transport)||null}
                        >
                            <TimePicker placeholder="Entrer l'heure" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Par qui ?"
                            name="parqui" 
                            initialValue={null}
                        >
                            <Input placeholder='Par qui ?' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Comment ?"
                            name="comment" 
                            initialValue={null}
                        >
                            <Input placeholder='Comment ?' />
                        </Form.Item>
                    </Col>
                </Row>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Témoins</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Qui a vu?"
                            name="temoin_vu" 
                            initialValue={(currentRecord && currentRecord.temoin_vu)||null}
                        >
                            <Input placeholder='Qui a vu ?' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Qui a entendu?"
                            name="temoin_entendu" 
                            initialValue={(currentRecord && currentRecord.temoin_entendu)||null}
                        >
                            <Input placeholder='Qui a entendu ?' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={8} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Premier avisé"
                            name="temoin_avise" 
                            initialValue={(currentRecord && currentRecord.temoin_avise)||null}
                        >
                            <Input placeholder='Premier avisé' />
                        </Form.Item>
                    </Col>
                </Row>
            </div>
        )
    }

    const Circonstances = () => {
        return (
            <div>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <div style={{background:"rgba(213, 210, 210, 0.17)",borderRadius:5,padding : 10}}>
                            <p>
                                <strong>Avant:</strong> But, objectif précis de l'action dans laquelle la victime etait engagée
                            </p>
                            <p>
                                <strong>Au moment:</strong> Ce qui s'est passé exactement au moment de l'accident
                            </p>
                            <p>
                                <strong>Après:</strong> Qu'a fait la victime, qui est intervenu, qu'a-t-on fait
                            </p>
                        </div>
                        
                    </Col>
                </Row>
                <br/>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Form.Item 
                            label="Avant"
                            name="avant" 
                            initialValue={null}
                        >
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Form.Item 
                            label="Au moment"
                            name="au_moment" 
                            initialValue={null}
                        >
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                        <Form.Item 
                            label="Après"
                            name="après" 
                            initialValue={null}
                        >
                            <TextArea rows={2} />
                        </Form.Item>
                    </Col>
                </Row>
                    
            </div>
        )
    }

    const Suite = () => {
        return (
            <div>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Recherche des causes</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Date prévue"
                            name="date_prevue" 
                            initialValue={null}
                        >
                            <DatePicker placeholder='Sélectionner'  format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Par qui ?"
                            name="parqui_suite" 
                            initialValue={null}
                        >
                            <Input placeholder='Par qui ?' />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Avec qui ?"
                            name="avecqui_suite" 
                            initialValue={null}
                        >
                            <Input placeholder='Avec qui ?' />
                        </Form.Item>
                    </Col>
                </Row>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Autres infos</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Certificat médical"
                            name="certificat_medical" 
                            initialValue={null}
                        >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Certificat médical"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                                <Option key={1}  value={"Oui"} > Oui </Option>
                                <Option key={2}  value={"Non"} > Non </Option>

                                    
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="ITT"
                            name="itt" 
                            initialValue={null}
                        >
                            <Input placeholder='ITT' />
                        </Form.Item>
                    </Col>
                </Row>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Date de guérison"
                            name="date_guerison" 
                            initialValue={null}
                        >
                            <DatePicker placeholder='Sélectionner'  format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                        <Form.Item 
                            label="Date de consolidation"
                            name="date_consolidation" 
                            initialValue={null}
                        >
                            <DatePicker placeholder='Sélectionner'  format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                </Row>
                <p style={{color:"var(--app-color)",fontWeight:"500"}} >Mesures prises</p>
                <Row  gutter={[24,24]}>
                    <Col xs={24} sm={24} md={24} lg={24} xl={24} >
                        <Form.Item 
                            name="mesures" 
                            initialValue={null}
                        >
                            <TextArea placeholder='Mesures prises' rows={3} />
                        </Form.Item>
                    </Col>
                </Row>

            </div>
        )
    }

    const items = [
        {
            key: '1',
            label: "Accident",
            children: <Accident /> ,
        },
        {
            key: '2',
            label: "Actions",
            children:  <Actions /> ,
        },
        {
            key: '3',
            label: "Circonstances",
            children:  <Circonstances /> ,
        },
        {
            key: '4',
            label: "Suite",
            children:  <Suite /> ,
        },
        
    ];

    return(
        <Form
            form={form}
            layout="vertical"
        >
            

            <Divider> Victime </Divider>
            <VictimeFields/>
            <br/>
            <Divider> Compte rendu </Divider>
            <Tabs defaultActiveKey="1" items={items} />
            <br/>

            <FormFooter 
                htmlType='submit'
                onCancel={()=>{setIsModalVisible(false)}}
                loading={formLoading}
            />
        </Form>
    )
}

export default AddAT;