import React, { useState , useEffect } from 'react'
import { Breadcrumb, Button, Card , Flex, Modal, Space, Tooltip, Typography} from "antd"
import { useNavigate } from 'react-router';
import { HomeOutlined , ExclamationCircleFilled, PlusOutlined, ReloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { deleteActions, getActions } from '../../actions/actions';
import { endpoints } from '../../constants/endpoints.constants';
import useFetch from '../../utils/hooks/useFetch';
import DataTable from '../../components/common/DataTable/DataTable';
import { deletePopup, formatDate } from '../../utils/helpers';
import AddAT from '../../components/specific/AddAT/AddAT';

const {Title} = Typography;

function DossierAT() {
  const navigate = useNavigate();
  const {data , dataCopy , setDataCopy , isLoading , onRefresh} = useFetch(endpoints.AT.LIST);
  const [operationType , setOperationType] = useState(null);
  

  const [open , setOpen] = useState(false);
  const [currentRecord , setCurrentRecord] = useState({});


  const onAdd = () => {
    //navigate("/espace-medical/dossier-accident-travail/add")
    setOperationType("add");
    setOpen(true);
  }
  const onEdit = (record) => {
      setOperationType("update");
      setOpen(true);
      setCurrentRecord({...record});
  }

  const onDelete = (record) => {
    deletePopup()
    .then((result)=>{
        // if (result.isConfirmed) {
        //     deleteActions(`${endpoints.visitesLieux.}/${record?.num_patient}`)
        //     .then((response)=>{
        //         if (response.data.Deleted === true) {
        //             message.success("Ligne retirée avec succès");
        //             onRefresh()
        //         }
        //     })
        // }
    });
  }


  return (
    <Card>

      <Title level={3} > Accidents de travail </Title>

      <Flex justify="flex-end" align="center" >
          <Space>
              <Tooltip title="Recherche avancée" >
                  <Button type='text' shape="circle" icon={<SearchOutlined/>} /*onClick={onDisplayAdvancedSearch}*/ />
              </Tooltip> 
              {/* <Tooltip title="Exporter" >
                  <Button type='text' shape="circle" icon={<ExportOutlined/>} onClick={onExport} />
              </Tooltip> 	 */}
              <Tooltip title="Actualiser" >
                  <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={onRefresh} />
              </Tooltip> 
              <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button>
          </Space>
      </Flex>

      <br/>
        
        <DataTable 
            dataSource={data}
            dataSourceCopy={dataCopy}
            setDataSourceCopy={setDataCopy}
            tableLoading={isLoading}
            columns={[
              {
                title: 'N°',
                dataIndex: 'num_at',
                key: 'num_at'
              },
              {
                  title: 'Matricule',
                  dataIndex: 'matricule',
                  key: 'matricule'
              },
              {
                  title: 'Prénom',
                  dataIndex: 'prenoms',
                  key: 'prenoms',
                  sorter: (a, b) => a.prenoms.charCodeAt(0) - b.prenoms.charCodeAt(0),
              },
              {
                  title: 'Nom',
                  dataIndex: 'nom',
                  key: 'nom',
                  sorter: (a, b) => a.nom.charCodeAt(0) - b.nom.charCodeAt(0),
              },
              {
                  title: 'Sexe',
                  dataIndex: 'sexe',
                  key: 'sexe'
              },
              {
                  title: 'Age',
                  dataIndex: 'age_patient',
                  key: 'age_patient',
                  sorter: (a, b) => a.age_patient - b.age_patient,
              } ,
              {
                  title: 'Date',
                  dataIndex: 'date_at',
                  key: 'date_at',
                  render: (record) => <div className='table-data'>
                      {formatDate(record)}
                  </div>
              } ,
              {
                render :  (record)=>(
                    <Flex justify="center" align="center" >
                        <Space>
                            <Tooltip title="Editer">
                                <Button type='link' icon={<EditOutlined/>} onClick={()=>{onEdit(record)}} />
                            </Tooltip>
                            <Tooltip title="Supprimer">
                                <Button type='link' danger icon={<DeleteOutlined/>} onClick={()=>{ onDelete(record) }} />
                            </Tooltip>
                        </Space>
                    </Flex>
                )
              }
            ]}
        />
        


        <Modal 
          title={
              (operationType === "add" && "Nouvel Accident de travail")||
              (operationType === "update" && "Mettre à jour les données")
          } 
          width={1000}
          open={open}
          onCancel={()=>{
              setOpen(false);
              setCurrentRecord(null);
          }}
          //width={1000}
          footer={null}
          destroyOnClose
        >
          <AddAT 
            setOpen={setOpen} 
            operationType={operationType}
            onRefresh={onRefresh}
            currentRecord={currentRecord}
          />
        </Modal>
    </Card>
  )
}

export default DossierAT