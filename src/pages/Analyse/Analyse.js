import React, { useState , useEffect } from 'react'
import { Modal, Button, Card,Col,DatePicker,Form,Row,Typography, message, Space, Tooltip, Spin, Flex, Tree} from "antd"
import dayjs from 'dayjs'
import { useNavigate } from 'react-router';
import TextArea from 'antd/es/input/TextArea';
import { postActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import useFetch from '../../utils/hooks/useFetch';
import { codesPrescriptions } from '../../constants/app.constants';
import FormFooter from '../../components/common/FormFooter/FormFooter';
import { deletePopup } from '../../utils/helpers';
import { DeleteOutlined } from '@ant-design/icons';
import DataTable from '../../components/common/DataTable/DataTable';
import AddAnalyse from '../../components/specific/AddAnalyse/AddAnalyse';
import BackButton from '../../components/common/BackButton/BackButton';

const {Title} = Typography;

const options = [
  {
    label: "Registre d'accueil",
    value: 'registre_accueil',
  },
  {
    label: 'Résultats NFS',
    value: 'resultat_nfs',
  },
  {
    label: 'Résultats SKAO',
    value: 'resultat_skao',
  },
  {
    label: 'Résultats ECBU',
    value: 'resultat_ecbu',
  },
  {
    label: 'Résultats SRV',
    value: 'resultat_srv',
  },
  {
    label: 'Résultats TB',
    value: 'resultat_tb',
  },
  {
    label: 'Résultats divers',
    value: 'resultat_divers',
  },
  {
    label: 'Résultats Biochimie (référence bulletin analyse)',
    value: 'resultat_biochimie',
  },
  {
    label: 'Résultats glycémie',
    value: 'resultat_glycemie',
  },
  {
    label: 'PV VIH (référence bulletin PCR,CV)',
    value: 'pv_vih',
  },
  {
    label: 'Palu (GE,TDR,codification)',
    value: 'palu',
  },
  {
    label: "Bulletin d'analyse",
    value: 'bulletin_analyse',
  },
  {
    label: 'Bulletin de demande de sang',
    value: 'bulletin_demande_sang',
  },
  {
    label: 'Régistre bio-Ndar',
    value: 'registre_bio_ndar',
  },
  {
    label: 'Régistre Gen Expert et IDRt',
    value: 'registre_gen_expert',
  }
];


function Analyse() {
  const navigate = useNavigate();
  const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
  const prescription  = JSON.parse(sessionStorage.getItem("prescription"));
  const editPrescription  = JSON.parse(sessionStorage.getItem("editPrescription"));
	const [isModalVisible , setIsModalVisible]=useState(false);
	const [loading , setLoading] = useState(false);
  const [form] = Form.useForm();
  const [operationType , setOperationType] = useState("add");

  const [analysesPrescrites , setAnalysesPrescrites] = useState(editPrescription?.listActes || []);
  const currentPatient  = JSON.parse(sessionStorage.getItem("currentPatient"));

  const onChange = (checkedValues) => {
    console.log('checked = ', checkedValues);
  };

  const save = () => {
    form
    .validateFields()
    .then((values) => {
        setLoading(true);
        switch (operationType) {
            case "add":
                const payload = {
                  codepresc : editPrescription?.codepresc || codesPrescriptions.ANA  ,
                  datepresc  : editPrescription?.datepresc || new Date(values.datepresc).toISOString()  ,
                  listActes : analysesPrescrites ,
                  diagnostic : editPrescription?.diagnostic || values.diagnostic ,
                  num_patient : editPrescription?.num_patient  || currentPatient.num_patient ,
                  numcons : editPrescription?.numcons || prescription?.numcons ,
                  numpresc : editPrescription?.numpresc ||  null 
                }
                if(analysesPrescrites.length !== 0) {
                  postActions(endpoints.prescriptions.ADD, payload)
                  .then(()=>{
                    setLoading(false);
                    message.success('Analyse prescrite avec succès');
                    setAnalysesPrescrites([]);
                  })
                }
                else {
                  setLoading(false);
                  message.warning("Veuillez  sélectionner les analyses à prescrire")
                }
                
                break;
            case "update":
                   
                break;
            default:
                break;
        }
        form.resetFields();  
        navigate(-1);
    })
    .catch((info) => {
        console.log('Validate Failed:', info);
    }); 
   
  }

  const {data , dataCopy , isLoading , onRefresh} = useFetch(`${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ANA}`);

	// useEffect(() => {
  //       if (prescription.medecin !== userConnected.username) {
  //         navigate(-1);
  //       }
	// }, []);

  
  return (
    <Card>
        <Flex align='flex-start' justify='space-between' >
            <BackButton />
        </Flex>
        <br/>
        <Title level={4} >Prescription Analyse du patient N° {currentPatient.num_patient} / {currentPatient.prenom_patient} {currentPatient.nom_patient} </Title>  


        <Form
            form={form}
            layout="vertical"
            onFinish={save}
        >
            {/* <Tree
                checkable
                //onCheck={onCheck}
                //checkedKeys={header}
                //treeData={treeData}
                treeData={options.map((item)=>{
                  return {
                    key : item?.value,
                    title : item?.label
                  }
                })}
                selectable={false}
                //height={300}
            />  */}

            <Row gutter={[24,24]} align={"stretch"} >
              <Col xs={24} sm={24} md={6} lg={6} xl={6} >
                <Form.Item 
                    label="Date Analyse"
                    name="datepresc" 
                    rules={[
                        {
                        required: true,
                        message: 'Champ obligatoire',
                        },
                    ]}
                    initialValue={dayjs(new Date())}
                >
                    <DatePicker format="DD/MM/YYYY" style={{width:"100%"}} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={10} lg={10} xl={10} >
                  <Form.Item 
                      label="Diagnostic"
                      name="diagnostic" 
                      rules={[
                          {
                              required: true,
                              message: 'Champ obligatoire',
                          },
                      ]}
                  >
                      <TextArea  rows={4} />
                  </Form.Item>
              </Col>
              <Col xs={24} sm={24} md={8} lg={8} xl={8} >
                <Button type="primary" style={{marginTop : 32}} onClick={()=>{setIsModalVisible(true);}} > Ajouter prescription(s) </Button>
              </Col>
            </Row>
            <br/>         
            <Title level={5} >Liste des analyses</Title>
            <DataTable 
                dataSourceCopy={analysesPrescrites}
                columns={[
                    {
                        title: 'Code',
                        dataIndex: 'codeacte',
                        key: 'codeacte'
                    },
                    {
                      title: 'Analyse',
                      dataIndex: 'libacte',
                      key: 'libacte'
                  },
                  {
                      title: 'Quantité',
                      dataIndex: 'qte',
                      key: 'qte'
                  },
                  {
                      title: 'Motif',
                      dataIndex: 'observation',
                      key: 'observation'
                  },
                    {
                        width : 'auto' ,
                        render :  (record)=>(
                            <Space>
                                <Tooltip title="Supprimer" >
                                    <Button type='link' danger icon={<DeleteOutlined/>} 
                                        onClick={()=>{ 
                                            deletePopup()
                                            .then((response)=>{
                                                if (response.isConfirmed) {
                                                    const temp = analysesPrescrites.filter((element)=>element.codeacte !== record.codeacte);
                                                    setAnalysesPrescrites(temp);
                                                }
                                            })
                                        }} 
                                    />
                                </Tooltip>
                            </Space>
                        )
                    }
                ]}
            
            />
            
            <br/>

            <FormFooter 
              loading={loading}
              onCancel={()=>{navigate(-1)}}
              htmlType='submit'
            />
            
          </Form>

         
          <Modal 
              title={"Nouvelle prescription analyse"}
              footer={null}
              open={isModalVisible}
              onCancel={()=>{setIsModalVisible(false)}}
              destroyOnClose
          >
            <AddAnalyse
              setIsModalVisible={setIsModalVisible} 
              analysesPrescrites={analysesPrescrites}
              setAnalysesPrescrites={setAnalysesPrescrites}
              listAnalyses={dataCopy}
            /> 
          </Modal>

        
    </Card>
  )
}

export default Analyse
