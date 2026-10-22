// import React, { useState, useEffect } from "react";
// import {
//   Modal,
//   Button,
//   Card,
//   Col,
//   DatePicker,
//   Form,
//   Row,
//   Typography,
//   message,
//   Space,
//   Tooltip,
//   Spin,
//   Flex,
//   Tree,
//   Checkbox,
//   Descriptions,
//   Collapse,
// } from "antd";
// import dayjs from "dayjs";
// import { useNavigate } from "react-router";
// import TextArea from "antd/es/input/TextArea";
// import { postActions } from "../../actions/actions";
// import { endpoints } from "../../constants/endpoints.constants";
// import useFetch from "../../utils/hooks/useFetch";
// import { codesPrescriptions } from "../../constants/app.constants";
// import FormFooter from "../../components/common/FormFooter/FormFooter";
// import { deletePopup, formatDate } from "../../utils/helpers";
// import { DeleteOutlined } from "@ant-design/icons";
// import DataTable from "../../components/common/DataTable/DataTable";
// import AddAnalyse from "../../components/specific/AddAnalyse/AddAnalyse";
// import BackButton from "../../components/common/BackButton/BackButton";
// import SearchBar from "../../components/common/SearchBar/SearchBar";
// import NotSpecified from "../../components/common/NotSpecified/NotSpecified";
// import GestionActes from "../../components/specific/GestionActes/GestionActes";

// const { Title, Text } = Typography;

// function Analyse() {
//   const navigate = useNavigate();
//   const userConnected = JSON.parse(sessionStorage.getItem("userConnected"));
//   const prescription = JSON.parse(sessionStorage.getItem("prescription"));
//   const editPrescription = JSON.parse(
//     sessionStorage.getItem("editPrescription")
//   );
//   const [isModalVisible, setIsModalVisible] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [form] = Form.useForm();
//   const [operationType, setOperationType] = useState("add");

//   const [checkKeys, setCheckKeys] = useState([]);

//   const [analysesPrescrites, setAnalysesPrescrites] = useState(
//     editPrescription?.listActes || []
//   );
//   const currentPatient = JSON.parse(sessionStorage.getItem("currentPatient"));

//   const [isGestionActesModalOpen, setIsGestionActesModalOpen] = useState(false);

//   const onChange = (checkedValues) => {
//     console.log("checked = ", checkedValues);
//   };

//   const save = () => {
//     form
//       .validateFields()
//       .then((values) => {
//         setLoading(true);
//         switch (operationType) {
//           case "add":
//             const payload = {
//               codepresc: editPrescription?.codepresc || codesPrescriptions.ANA,
//               datepresc:
//                 editPrescription?.datepresc ||
//                 new Date(values.datepresc).toISOString(),
//               listActes: analysesPrescrites,
//               diagnostic: editPrescription?.diagnostic || values.diagnostic,
//               num_patient:
//                 editPrescription?.num_patient || currentPatient.num_patient,
//               numcons: editPrescription?.numcons || prescription?.numcons,
//               numpresc: editPrescription?.numpresc || null,
//             };
//             if (analysesPrescrites.length !== 0) {
//               postActions(endpoints.prescriptions.ADD, payload).then(() => {
//                 setLoading(false);
//                 message.success("Analyse prescrite avec succès");
//                 setAnalysesPrescrites([]);
//               });
//             } else {
//               setLoading(false);
//               message.warning(
//                 "Veuillez  sélectionner les analyses à prescrire"
//               );
//             }

//             break;
//           case "update":
//             break;
//           default:
//             break;
//         }
//         form.resetFields();
//         navigate(-1);
//       })
//       .catch((info) => {
//         console.log("Validate Failed:", info);
//       });
//   };

//   const { data, dataCopy, setDataCopy, isLoading, onRefresh } = useFetch(
//     `${endpoints.actes.LIST}?codeacte=${codesPrescriptions.ANA}`
//   );

//   const analysesParCategorie = (dataCopy || []).reduce((acc, item) => {
//     const categorie = item?.categorie || "Autres";
//     if (!acc[categorie]) {
//       acc[categorie] = [];
//     }
//     acc[categorie].push(item);
//     return acc;
//   }, {});

//   // useEffect(() => {
//   //       if (prescription.medecin !== userConnected.username) {
//   //         navigate(-1);
//   //       }
//   // }, []);

//   const collapseItems = [
//     {
//       key: "1",
//       label: "Infos patient",
//       children: (
//         <div>
//           <Descriptions
//             column={3}
//             layout="horizontal" /*layout={window.screen.height < 992 && 'vertical'}*/
//           >
//             <Descriptions.Item label="Matricule">
//               {currentPatient?.num_patient || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Nom">
//               {currentPatient?.nom_patient || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Prénom">
//               {currentPatient?.prenom_patient || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Sexe">
//               {currentPatient?.sexe_patient || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Age">
//               {`${currentPatient?.age_patient} an(s)` || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Groupe sanguin">
//               {currentPatient?.group_sanguin || <NotSpecified />}
//             </Descriptions.Item>
//             <Descriptions.Item label="Diagnostic">
//               {prescription?.diagnostic || <NotSpecified />}
//             </Descriptions.Item>
//           </Descriptions>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <Card >
//       <Flex align="flex-start" justify="space-between">
//         <BackButton />
//       </Flex>
//       <br />
//       {/* <Title level={4}>
//         Prescription Analyse du patient N° {currentPatient.num_patient} /{" "}
//         {currentPatient.prenom_patient} {currentPatient.nom_patient}{" "}
//       </Title> */}

//       <Title level={4}>
//         Prescription Analyse
//       </Title>

//       <Collapse items={collapseItems} defaultActiveKey={["1"]} />


//       <Form form={form} layout="vertical" onFinish={save}>
//         {/* <Tree
//                 checkable
//                 //onCheck={onCheck}
//                 //checkedKeys={header}
//                 //treeData={treeData}
//                 treeData={dataCopy.map((item)=>{
//                   return {
//                     key : item?.codeacte,
//                     title : item?.libacte
//                   }
//                 })}
//                 selectable={false}
//                 //height={300}
//                 allowDrop={false}
//             />  */}

//         <Row gutter={[24, 24]} align={"stretch"} style={{ display: "none" }} >
//           <Col xs={24} sm={24} md={6} lg={6} xl={6}>
//             <Form.Item
//               label="Date Analyse"
//               name="datepresc"
//               rules={[
//                 {
//                   required: true,
//                   message: "Champ obligatoire",
//                 },
//               ]}
//               initialValue={dayjs(new Date())}
//             >
//               <DatePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
//             </Form.Item>
//           </Col>

//           {/* <Col xs={24} sm={24} md={10} lg={10} xl={10}>
//             <Form.Item
//               label="Diagnostic"
//               name="diagnostic"
//               rules={[
//                 {
//                   required: true,
//                   message: "Champ obligatoire",
//                 },
//               ]}
//             >
//               <TextArea rows={4} />
//             </Form.Item>
//           </Col> */}
//           {/* <Col xs={24} sm={24} md={8} lg={8} xl={8}>
//             <Button
//               type="primary"
//               style={{ marginTop: 32 }}
//               onClick={() => {
//                 setIsModalVisible(true);
//               }}
//             >
//               {" "}
//               Ajouter prescription(s){" "}
//             </Button>
//           </Col> */}
//         </Row>
//         <br />
//         <Card title="Sélectionner les analyses à prescrire"
//           extra={
//             <Space>
//               <SearchBar
//                 data={data}
//                 setDataCopy={setDataCopy}
//                 listKeys={["codeacte", "libacte", "categorie"]}
//               />
//               <Button
//                 type="primary"
//                 onClick={() => {
//                   setIsGestionActesModalOpen(true);
//                 }}
//               >
//                 Gérer
//               </Button>
//             </Space>
//           }
//           actions={[
//             <Flex style={{ width: "100%", padding: "0 16px" }} justify="flex-end" >
//               <Space>
//                 <Button
//                   type="primary"
//                   danger
//                   onClick={() => {
//                     setCheckKeys([]);
//                   }}
//                   disabled={checkKeys.length === 0}
//                 >
//                   Réinitialiser
//                 </Button>
//                 <Button
//                   type="primary"
//                   onClick={() => {
//                     let tmp = [];
//                     checkKeys.forEach((element) => {
//                       let res = dataCopy?.find(
//                         (item) => item.codeacte === element
//                       );
//                       tmp.push(res);
//                     });
//                     setAnalysesPrescrites(tmp);
//                     //setCheckKeys([]);
//                   }}
//                   disabled={checkKeys.length === 0}
//                 >
//                   Ajouter
//                 </Button>
//               </Space>
//             </Flex>
//           ]}
//         >

//           <Row gutter={[24, 24]} align={"stretch"}>
//             {Object.entries(analysesParCategorie)
//               .sort(([a], [b]) => {
//                 if (a === "Autres") return 1;
//                 if (b === "Autres") return -1;
//                 return 0;
//               })
//               .map(([categorie, items]) => {
//                 const codesCategorie = items.map((item) => item?.codeacte);
//                 return (
//                   <Col xs={24} sm={12} md={6} lg={6} xl={6} key={categorie}>
//                     <Text strong>{categorie}</Text>
//                     <br />
//                     <br />
//                     <Checkbox.Group
//                       style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px" }}
//                       value={checkKeys.filter((key) => codesCategorie.includes(key))}
//                       options={items.map((item) => {
//                         return {
//                           value: item?.codeacte,
//                           label: item?.libacte,
//                         };
//                       })}
//                       onChange={(values) => {
//                         setCheckKeys((prev) => [
//                           ...prev.filter((key) => !codesCategorie.includes(key)),
//                           ...values,
//                         ]);
//                       }}
//                     />
//                   </Col>
//                 );
//               })}
//             {/* <Button type="primary"
//             onClick={()=>{
//               let tmp = [];
//               checkKeys.forEach(element => {
//                 let res = dataCopy?.find((item) => item.codeacte === element);
//                 tmp.push(res);
//               });
//               setAnalysesPrescrites(tmp);
//             }}
//             disabled={checkKeys.length === 0}
//           >Ajouter</Button> */}

//           </Row>

//         </Card>
//         <br />
//         <Title level={5}>Liste des analyses</Title>
//         <DataTable
//           dataSourceCopy={analysesPrescrites}
//           columns={[
//             {
//               title: "Code",
//               dataIndex: "codeacte",
//               key: "codeacte",
//             },
//             {
//               title: "Analyse",
//               dataIndex: "libacte",
//               key: "libacte",
//             },
//             {
//               title: "Quantité",
//               dataIndex: "qte",
//               key: "qte",
//             },
//             {
//               title: "Motif",
//               dataIndex: "observation",
//               key: "observation",
//             },
//             {
//               width: "auto",
//               render: (record) => (
//                 <Space>
//                   <Tooltip title="Supprimer">
//                     <Button
//                       type="link"
//                       danger
//                       icon={<DeleteOutlined />}
//                       onClick={() => {
//                         deletePopup().then((response) => {
//                           if (response.isConfirmed) {
//                             const temp = analysesPrescrites.filter(
//                               (element) => element.codeacte !== record.codeacte
//                             );
//                             setAnalysesPrescrites(temp);
//                           }
//                         });
//                       }}
//                     />
//                   </Tooltip>
//                 </Space>
//               ),
//             },
//           ]}
//         />
//         {/* <DataTable
//           dataSourceCopy={analyses}
//           columns={[
//             {
//               title: "Code",
//               dataIndex: "codeacte",
//               key: "codeacte",
//             },
//             {
//               title: "Analyse",
//               dataIndex: "libacte",
//               key: "libacte",
//             },
//             {
//               width: "auto",
//               render: (record) => (
//                 <Flex justify="center">
//                   <Tooltip title="Supprimer">
//                     <Button
//                       type="link"
//                       danger
//                       icon={<DeleteOutlined />}
//                       onClick={() => {
//                         deletePopup().then((response) => {
//                           if (response.isConfirmed) {
//                             const temp = analyses.filter(
//                               (element) => element.codeacte !== record.codeacte
//                             );
//                             setAnalyses(temp);
//                           }
//                         });
//                       }}
//                     />
//                   </Tooltip>
//                 </Flex>
//               ),
//             },
//           ]}
//         />
//         <br /> */}

//         <FormFooter
//           loading={loading}
//           onCancel={() => {
//             navigate(-1);
//           }}
//           htmlType="submit"
//         />
//       </Form>

//       <Modal
//         title={"Nouvelle prescription analyse"}
//         footer={null}
//         open={isModalVisible}
//         onCancel={() => {
//           setIsModalVisible(false);
//         }}
//         destroyOnClose
//       >
//         <AddAnalyse
//           setIsModalVisible={setIsModalVisible}
//           analysesPrescrites={analysesPrescrites}
//           setAnalysesPrescrites={setAnalysesPrescrites}
//           listAnalyses={dataCopy}
//         />
//       </Modal>


//       <Modal
//         title="Gestion des actes"

//         style={{ top: 20 }}
//         styles={{
//           header: { padding: "12px 24px", },
//           footer: { padding: "12px 24px" },
//           content: {
//             margin: 0,
//             padding: 0,
//             borderRadius: "8px 8px 8px 8px",
//             overflow: "hidden"
//           },
//           body: {
//             overflow: "auto",
//             minHeight: "50vh",
//             maxHeight: "80vh",
//             padding: "12px 24px",
//           },
//         }}
//         width={1000}
//         footer={null}
//         open={isGestionActesModalOpen}
//         onCancel={() => {
//           setIsGestionActesModalOpen(false);
//         }}
//         destroyOnClose
//       >
//         <GestionActes
//           setIsModalVisible={setIsGestionActesModalOpen}
//         />
//       </Modal>


//     </Card>
//   );
// }

// export default Analyse;

import Prescription from "../../components/specific/Prescription/Prescription";
import { TypePrescription } from "../../utils/types/types.ts";

function Analyse() {
  return (
    <Prescription typePrescription={TypePrescription.ANALYSE} />
  )
}

export default Analyse