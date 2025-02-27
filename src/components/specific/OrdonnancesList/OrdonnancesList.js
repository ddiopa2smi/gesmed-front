import { EyeOutlined, ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Card, Col, Flex, Modal, Row, Segmented, Select, Space, Tag, Tooltip, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import DataTable from '../../common/DataTable/DataTable';
import useFetch from '../../../utils/hooks/useFetch';
import useSearch from '../../../utils/hooks/useSearch';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import AdvancedSearchButton from '../../common/AdvancedSearchButton/AdvancedSearchButton';
import FormFooter from '../../common/FormFooter/FormFooter';
import { endpoints } from '../../../constants/endpoints.constants';
import DetailsPrescription from '../DetailsPrescription/DetailsPrescription';
import { ServiceType } from '../../../utils/types/types.ts';
import { formatDate, formatDateTime } from '../../../utils/helpers';
import { render } from '@testing-library/react';

const {Option} = Select;
const {Title} = Typography;
function OrdonnancesList() {
    const [segmentedValue , setSegmentedValue] = useState("Non");
    const {data , dataCopy, setDataCopy , isLoading , error , onRefresh} = useFetch(endpoints.prescriptions.LIST);
    
    const {getColumnSearchProps} = useSearch()
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);

    const onDisplayAdvancedSearch = () => {
        setOperationType("ads");
        setOpen(true);
    }
    
    const columns = [
        {
            title: 'N°',
            dataIndex: 'numpresc',
            key: 'numpresc',
            ...getColumnSearchProps('numpresc')
        },
        {
            title: 'Date prescription',
            dataIndex: 'datepresc',
            key: 'datepresc',
            render : (record)=>(<div className="table-data">{formatDateTime(record)}</div>)
        },
        {
            title: 'N° patient',
            dataIndex: 'num_patient',
            key: 'num_patient',
            ...getColumnSearchProps('num_patient')
        },
        {
            title: 'Patient',
            dataIndex: 'patient',
            key: 'patient',
            ...getColumnSearchProps('patient')
        },
        {
            title: 'Prescripteur',
            dataIndex: 'username',
            key: 'username',
            ...getColumnSearchProps('username')
        },
        {
            title: 'Statut',
            dataIndex: 'isdone',
            key: 'isdone',
            ...getColumnSearchProps('isdone'),
            render : (record)=>(
                <Tag color={record === "Oui" ? "green" : "red"}>{record === "Oui" ? "Servie" : "En instance"}</Tag>
            )
        },
        {
            render :  (record)=>(
                <Flex align='center' >
                    <Space size="middle" >
                        {
                            record.isdone === "Non" && (
                                <Button type='text' icon={<EyeOutlined/>} onClick={()=>{setCurrentRecord(record); setOpen(true);}}  />
                            )
                        }
                        
                    </Space>
                </Flex>
            )
        }
    ];
    return (
        <Card >
            <Flex justify="space-between" align="center" >
                <Title level={4} > Liste des ordonnances prescrites </Title>
                <Space>
                    {/* <AdvancedSearchButton onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp; */}
                    <ReloadButton onRefresh={onRefresh} /> 
                    <Segmented 
                        defaultValue={segmentedValue}
                        options={[
                            {
                                value : "Non",
                                label : "instance"
                            },
                            {
                                value : "Oui",
                                label : "Servies"
                            }
                        ]}
                        
                        onChange={(value)=>{
                            setSegmentedValue(value)
                        }}
                    
                    />
                </Space>
            </Flex>

            <br/>

            <DataTable 
                isLoading={isLoading}
                dataSource={data.filter((element)=> element.code === "ORD")}
                dataSourceCopy = {segmentedValue === "Non" ? dataCopy.filter((element)=> element.code === "ORD" && element.isdone === "Non" ) : dataCopy.filter((element)=> element.code === "ORD" && element.isdone === "Oui")}
                setDataSourceCopy={setDataCopy}
                columns={segmentedValue === "Oui" ?
                    [
                        ...columns,
                        {
                            title: 'Date effet',
                            dataIndex: 'date_effet',
                            key: 'date_effet',
                            ...getColumnSearchProps('date_effet'),
                            render : (record)=>(<div className="table-data">{formatDateTime(record)}</div>)
                        },
                        {
                            title: 'Effectué par',
                            dataIndex: 'effectue_par',
                            key: 'effectue_par',
                            ...getColumnSearchProps('effectue_par')
                        },
                    ] : columns
                }
            />

            <Modal 
                style={{ top: 20 }}
                styles={{
                  header: { padding: "12px 24px" },
                  footer: { padding: "12px 24px" },
                  content: { margin: 0, padding: 0 },
                  body: {
                    overflow: "auto",
                    minHeight: "50vh",
                    maxHeight: "80vh",
                    padding: "12px 24px",
                  },
                }}
                width={1000}
                title={`Ordonnance N° ${currentRecord?.numpresc}`}
                open={open} 
                onCancel={()=>{
                    setOpen(false);
                    setCurrentRecord(null);
                }}
                footer={null}
            >
                <DetailsPrescription prescriptionItem={currentRecord} serviceType={ServiceType.PHARMACIE} setOpen={setOpen} onRefresh={onRefresh} />
            </Modal>
        </Card>
    )
}

export default OrdonnancesList