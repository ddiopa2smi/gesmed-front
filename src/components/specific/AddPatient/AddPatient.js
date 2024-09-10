import { Col, Form, Input, Row, Select, DatePicker, message } from 'antd';
import { useEffect, useState } from 'react';
import { getActions, postActions, putActions } from './../../../actions/actions';
import { endpoints } from '../../../constants/endpoints.constants';
import FormFooter from '../../common/FormFooter/FormFooter';
import useFetch from '../../../utils/hooks/useFetch';
import dayjs from "dayjs"
import axios from 'axios';
import { API_URL } from '../../../constants/environment.constants';
import Swal from 'sweetalert2';

const {TextArea} = Input;
const { Option } = Select;

function AddPatient({ setOpen , operationType , onRefresh , currentRecord}) {
    const [form] = Form.useForm();
    const [formLoading , setFormLoading] = useState(false);
    const [typePatient , setTypePatient] = useState(null);
    const [matriculeToSearch , setMatriculeToSearch] = useState(null);
    const [listBeneficiaires, setListBeneficiaires] = useState([]);
    const [listBeneficiairesLoading , setListBeneficiairesLoading] = useState(false)
    const [benefLuiMeme, setBenefLuiMeme] = useState(null);
    const {data : listTypePatients , isLoading : listTypePatientsLoading } = useFetch(endpoints.patients.LIST_TYPE)
   

     
    const save = () => {
        form
        .validateFields()
        .then((values) => {
            setFormLoading(true);
            switch (operationType) {
                case "add":
                        values.num_patient = values.benef;
                        values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        console.log(values)
                        postActions(endpoints.patients.ADD,values)
                        .then((response)=>{
                            //setFormLoading(false);

                            if (response.data.Added) {
                                message.success("Nouveau patient ajouté avec succès");
                                
                                setOpen(false);
                                form.resetFields();
                                onRefresh();
                            }
                            else {
                                message.warning("Patient déja ajouté")
                            }

                            
                        })
                        .finally(()=>{
                            // setFormLoading(false)
                            // setOpen(false);
                            // form.resetFields();
                            // onRefresh();
                            setFormLoading(false)
                        })
                        
                    break;
                case "update":
                        values.datenaiss_patient = new Date(values.datenaiss_patient).toISOString();
                        values.num_patient = currentRecord ? currentRecord.num_patient : null;
                        putActions(endpoints.patients.UPDATE,values)
                        .then((response)=>{
                            setFormLoading(false);
                            message.success("Opération éffectuée avec succès");
                            setOpen(false);
                            form.resetFields();
                            onRefresh();
                        })
                        setOpen(false);
                    break;
                default:
                    break;
            }
        })
        .catch((info) => {
            console.log('Validate Failed:', info);
        });
    }

   
    const handleMatricule = (e) => {
        setMatriculeToSearch(e.target.value)
    }

    

    useEffect(()=>{
        const searchPatientByMatricule = (value) => {
            if (value && value !== null) { 
                setListBeneficiairesLoading(true);
                getActions(`/api/Participant/Patient/${value}`)
                .then((response)=>{
                    //console.log(response.data);
                    
                    if (response?.data?.numcont === "None") {
                        Swal.fire("Avertissement", "Participant introuvable")
                    }else{
                        // Swal.fire("Succès", "Ouvrir la liste Patient pour sélectionner un participant")
                        setBenefLuiMeme(response.data)
                        getActions(`/api/Benef/list/${response.data.numcont}`)
                        .then((res)=>{
                            const data = res.data ;
                            
                            setListBeneficiaires(data);
                            
                        })
                    }
                })
                .finally(()=>{
                    setListBeneficiairesLoading(false)
                })
            }
        }
        searchPatientByMatricule(matriculeToSearch)
    },[matriculeToSearch])

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={save}
            preserve={false}
            onValuesChange={(changedValues , values)=>{
                if (changedValues.benef) {
                    //console.log(changedValues)
                    let benefSelected = null; 
                    for (let i = 0; i < listBeneficiaires.length; i++) {
                        const element = listBeneficiaires[i];
                        if (element.matribenef === changedValues.benef) {
                            benefSelected = element;
                            break;
                        }
                    }
                    
                    //console.log(benefSelected)
                    //console.log(benefLuiMeme)
                    if (changedValues.benef === benefLuiMeme.matipm) {
                        form.setFieldValue("nom_patient",benefLuiMeme?.nom)
                        form.setFieldValue("prenom_patient",benefLuiMeme?.prenom)
                    }else{
                        form.setFieldValue("nom_patient",benefSelected?.nom)
                        form.setFieldValue("prenom_patient",benefSelected?.prenoms)
                    }
                    form.setFieldValue("sexe_patient",benefSelected?.sexe)
                    form.setFieldValue("datenaiss_patient", dayjs(new Date(benefSelected.datenaiss)))
                }
                
            }}
        >
            <Row gutter={[8,8]} >
                <Col xs={24} sm={8} md={8} lg={8} xl={8}>
                    <Form.Item 
                        name="type_patient" 
                        label="Type patient"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.type_patient}
                    >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Type de patient"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                onChange={(value)=>{setTypePatient(value);}}
                                loading={listTypePatientsLoading}
                            >     
                                {
                                    listTypePatients.map((item , key)=>( //item.code_pat !== 1 &&
                                        <Option key={key}  value={item.code_pat} > {item.type_pat} </Option>
                                    ))
                                }
                                
                            </Select>
                    </Form.Item>
                </Col>
                {
                    // Must fixed the search of patients when enter the matricule later 
                    //Fixed
                    typePatient === 1 && 
                    <>
                        <Col xs={24} sm={4} md={4} lg={4} xl={4} >
                            <Form.Item
                                name="matricule"
                                label="Matricule"
                                //initialValue={(currentRecord && currentRecord.num_patient)||null}
                            >
                                <Input  value={matriculeToSearch} onBlur={(e)=> handleMatricule(e) } />
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12} >
                            <Form.Item 
                                name="benef" 
                                label="Patient"
                                rules={[
                                    {
                                    required: true,
                                    message: 'Sélection obligatoire',   
                                    },
                                ]}
                                //initialValue={currentRecord?.benef}
                                //initialValue={listBeneficiaires[0]?.matribenef}
                            >
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Patient"
                                    optionFilterProp="children" 
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                    loading={listBeneficiairesLoading}
                                >    
                                    {
                                        listBeneficiaires?.map((item,key)=>(
                                            <Option key={key}  value={item?.matribenef} > {item?.matribenef} - {item?.prenoms} </Option>
                                        ))
                                    }
                                                
                                </Select>
                            </Form.Item>
                        </Col>
                    </>
                }
            </Row>
            
            {
                // Must fixed the search of patients when enter the matricule later 
                //Fixed
                typePatient === 4 && 
                <>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="phone"
                                label="Téléphone"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                ]}
                                //initialValue={currentRecord?.prenom_patient}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="num_piece"
                                label="Numéro de la pièce "
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                ]}
                                //initialValue={currentRecord?.prenom_patient}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="nom_pere"
                                label="Nom du père"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                ]}
                                //initialValue={currentRecord?.prenom_patient}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="nom_mere"
                                label="Nom de la mère"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Champ obligatoire',
                                    },
                                ]}
                                //initialValue={currentRecord?.prenom_patient}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                    <Row gutter={[24,24]} >
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="profession_patient"
                                label="Profession du patient"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'Champ obligatoire',
                                //     },
                                // ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                            <Form.Item
                                name="profession_conjoint"
                                label="Profession du conjoint"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'Champ obligatoire',
                                //     },
                                // ]}
                            >
                                <Input/>
                            </Form.Item>
                        </Col>
                    </Row>
                </>
            }
            <Row gutter={[24,24]} >
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="sexe_patient" 
                        label="Sexe"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.sexe_patient}
                    >
                            <Select
                                style={{width:'100%',background:"transparent"}}
                                showSearch
                                placeholder="Sexe"
                                optionFilterProp="children" 
                                filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                            >     
                                        <Option  value={'MA'} > Masculin </Option>
                                        <Option  value={'FE'} > Féminin </Option>
                                
                            </Select>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                    <Form.Item 
                        name="group_sanguin" 
                        label="Groupe sanguin"
                        rules={[
                            {
                            required: true,
                            message: 'Sélection obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.group_sanguin}
                    >
                        <Select
                            style={{width:'100%',background:"transparent"}}
                            showSearch
                            placeholder="Groupe Sanguin"
                            optionFilterProp="children"
                            filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
                        >     
                                <Option value={'A'} > A </Option>                  
                                <Option value={'A+'} > A+ </Option>                  
                                <Option value={'A-'} > A- </Option>                  
                                <Option value={'B'} > B </Option>                  
                                <Option value={'B+'} > B+ </Option>                  
                                <Option value={'B-'} > B- </Option>                  
                                <Option value={'AB'} > AB </Option>                  
                                <Option value={'AB+'} > AB+ </Option>                  
                                <Option value={'AB-'} > AB- </Option>                  
                                <Option value={'O'} > O </Option>                  
                                <Option value={'O+'} > O+ </Option>                  
                                <Option value={'O-'} > O- </Option>                  
                        </Select>
                    </Form.Item>
                </Col>
                
            </Row>
            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="prenom_patient"
                        label="Prénom(s)"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.prenom_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="nom_patient"
                        label="Nom"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord?.nom_patient}
                    >
                        <Input />
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>  
                    <Form.Item
                        name="datenaiss_patient"
                        label="Date de naissance"
                        rules={[
                            {
                                required: true,
                                message: 'Champ obligatoire',
                            },
                        ]}
                        initialValue={currentRecord === null ? dayjs(new Date()) : dayjs(new Date(currentRecord?.datenaiss_patient))}
                    >
                        <DatePicker placeholder='choisir la date' format="DD/MM/YYYY" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="tel_patient"
                        label="Téléphone"
                        initialValue={currentRecord?.tel_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="email_patient"
                        label="Email"
                        rules={[
                            // {
                            //     required: true,
                            //     message: 'Champ obligatoire',
                            // },
                            {
                                type: "email",
                                message: 'Entrer un email svp',
                            },
                        ]}
                        initialValue={currentRecord?.email_patient}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                    <Form.Item
                        name="contact"
                        label="Contact"
                        initialValue={currentRecord?.contact}
                    >
                        <Input/>
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={[24,24]}>
                <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                    <Form.Item
                        name="obs_part"
                        label="Observation"
                        initialValue={currentRecord?.obs_part}
                    >
                        <TextArea rows={4} placeholder='Observation' />
                    </Form.Item>
                </Col>
            </Row>

            <FormFooter 
                loading={formLoading}
                onCancel={()=>{setOpen(false)}}
                htmlType='submit'
            />

        </Form>
    )
}

export default AddPatient