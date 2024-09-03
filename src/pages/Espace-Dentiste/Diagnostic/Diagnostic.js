import React, { useState } from 'react'
import FormFooter from '../../../components/common/FormFooter/FormFooter'
import { Button, Card, Col, DatePicker, Divider, Flex, Form, Input, Row, Select, Space, Typography } from 'antd'
import BackButton from '../../../components/common/BackButton/BackButton'
import ReloadButton from '../../../components/common/ReloadButton/ReloadButton'
import AddAndEditDropdown from '../../../components/common/AddAndEditDropdown/AddAndEditDropdown'
import TextArea from 'antd/es/input/TextArea'
import { useNavigate } from 'react-router'
import dayjs from "dayjs"

const {Title , Text} = Typography;
const {Option} = Select;

const pathologies = [
    {
        code_patho : 1,
        libelle_patho : "Carie dentaire"
    },
    {
        code_patho : 2,
        libelle_patho : "Pulpite"
    },
    {
        code_patho : 3,
        libelle_patho : "Abscès péri-apical"
    },
    {
        code_patho : 4,
        libelle_patho : "Dents incluses"
    },
    {
        code_patho : 5,
        libelle_patho : "Malocclusion"
    },
    {
        code_patho : 6,
        libelle_patho : "Bruxisme"
    },
    {
        code_patho : 7,
        libelle_patho : "Kyste dentaire"
    },
    {
        code_patho : 8,
        libelle_patho : "Plaque dentaire"
    },
    {
        code_patho : 9,
        libelle_patho : "Tartre"
    },
    {
        code_patho : 10,
        libelle_patho : "Gingivite"
    },
    {
        code_patho : 11,
        libelle_patho : "Parodontite"
    }
]

const motifs = [
    {
        code_motifcons : 1,
        libelle_motifcons : "Visite"
    },
    {
        code_motifcons : 2,
        libelle_motifcons : "Bilan"
    }
]


function Diagnostic() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading , setLoading] = useState(false);

    const save = () => {
        console.log("save here")
    }
    return (
        <Card /*loading={consultationDataLoading}*/ >
            <Flex justify='flex-start' align='center' >
                <BackButton /> &nbsp;&nbsp;
            </Flex>
            <br/>
            <br/>
            <Flex justify='space-between' align='center' >
                <Title level={4} > Diagnostic de la dent </Title>
                <Space align="center" >
                    <ReloadButton 
                        //onRefresh={refreshConsultation}
                    />
                </Space>
            </Flex>
           

            {/* <Text level={4} > Patient : {currentPatient.num_patient} / {currentPatient.prenom_patient} {currentPatient.nom_patient} </Text> */}

            <Form
                layout='vertical'
                form={form}
                name="diagnostic_dent_form"
                //initialValues={initConsultation}
                
                // onValuesChange={(changedValues , allValues)=>{

                //     if (changedValues.code_patho) {
                //         const code_p = changedValues.code_patho;
                //         pathologies.forEach(element => {
                //             if (element.code_patho === code_p) {
                //                 setPathologieSelected(element);
                //             }
                //         });
                //     }

                //     if (changedValues.code_motifcons) {
                //         const code_m = changedValues.code_motifcons;
                //         motifs.forEach(element => {
                //             if (element.code_motifcons === code_m) {
                //                 setMotifSelected(element);
                //             }
                //         });
                //     }

                //     if (changedValues.code_region) {
                //         const code_r = changedValues.code_region;
                //         regions.forEach(element => {
                //             if (element.code_region === code_r) {
                //                 setRegionSelected(element);
                //             }
                //         });
                //     }
                    
                //     if (changedValues.nb_jours_rv) {
                //         const newValue = new Date().setDate(new Date(allValues.datecons).getDate() + changedValues.nb_jours_rv);
                //         allValues.date_rv = newValue;
                //         form.setFieldValue("date_rv",dayjs(newValue));
                //     }

                //     if (changedValues.nb_jours_rm) {
                //         const newValue = new Date().setDate(new Date(allValues.debut_rm).getDate() + changedValues.nb_jours_rm);
                //         allValues.fin_rm = newValue;
                //         form.setFieldValue("fin_rm",dayjs(newValue));
                //     }

                // }}

                onFinish={save}
            >
                <Divider/>

                <Form.Item 
                    label="Date cons"
                    name="datecons" 
                    initialValue={dayjs(new Date())}
                >
                    <DatePicker disabled format="dddd, DD MMMM YYYY" />
                </Form.Item>
                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Pathologie"
                                name="code_patho" 
                                style={{width:"90%"}}
                            >
                                
                                {/* <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Pathologie"
                                    optionFilterProp="children" 
                                    loading={pathologiesLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                    {
                                        pathologies.map((item , key)=>(
                                            <Option key={key}  value={item.code_patho} > {item.libelle_patho} </Option>
                                        ))
                                    }
                                        
                                </Select> */}
                                <Select
                                    style={{width:'100%',background:"transparent"}}
                                    showSearch
                                    placeholder="Pathologie"
                                    optionFilterProp="children" 
                                    //loading={pathologiesLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                    {
                                        pathologies.map((item , key)=>(
                                            <Option key={key}  value={item.code_patho} > {item.libelle_patho} </Option>
                                        ))
                                    }
                                        
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[]} />
                        </Flex>        
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Motif de consultation"
                                name="code_motifcons" 
                                style={{width:"90%"}}
                            >
                                <Select
                                    showSearch
                                    placeholder="Motif de consultation"
                                    optionFilterProp="children" 
                                    //loading={motifsLoading}
                                    filterOption={(input, option) => option.children[1].toLowerCase().includes(input.toLowerCase())}
                                >     
                                        {
                                            motifs.map((item , key)=>(
                                                <Option key={key}  value={item.code_motifcons} > {item.libelle_motifcons} </Option>
                                            ))
                                        }
                                </Select>
                            </Form.Item>
                            <AddAndEditDropdown items={[]} />
                        </Flex>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Flex align='center' >
                            <Form.Item 
                                label="Région concernée"
                                name="code_region" 
                                style={{width:"100%"}}
                                initialValue="APPAREIL DENTAIRE"
                            >
                                <Input disabled  />
                            </Form.Item>
                        </Flex>
                    </Col>
                </Row>

                <Divider> Séance </Divider>

                <Row gutter={[24,24]}>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Résultat interrogation"
                            name="resultat" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Examen"
                            name="examen" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12} md={8} lg={8} xl={8} >
                        <Form.Item 
                            label="Diagnostic"
                            name="diagnostic" 
                        >
                            <TextArea rows={4} />
                        </Form.Item>
                    </Col>
                </Row>
                
                
                <br/>

                <FormFooter 
                    onCancel={()=>{navigate(-1)}}
                    loading={loading}
                    htmlType={"submit"}
                />

            </Form>

            {/* <Modal
                title={currentSelectableTask === "PATHOLOGIE" && "Pathologie" || currentSelectableTask === "MOTIF" && "Motif" || currentSelectableTask === "REGION" && "Région" }
                open={open}
                //width={700}
                onCancel={()=>{
                    setOpen(false);
                    setPathologieSelected(null);
                    setMotifSelected(null);
                    setRegionSelected(null);
                }}
                footer={null}
                destroyOnClose
            >
                {currentSelectableTask === "PATHOLOGIE" && <AddPathologie  setOpen={setOpen} operationType={operationType} onRefresh={pathologiesRefreshList} currentRecord={pathologieSelected} /> }

                {currentSelectableTask === "MOTIF" && <AddMotif  setOpen={setOpen} operationType={operationType} onRefresh={motifsRefreshList} currentRecord={motifSelected} /> }

                {currentSelectableTask === "REGION" && <AddRegion  setOpen={setOpen} operationType={operationType} onRefresh={regionsRefreshList} currentRecord={regionSelected} />}
                
            </Modal> */}
            
            
        </Card>
    )
}

export default Diagnostic