import { ReloadOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Tooltip, Typography, message } from 'antd'
import React, { useState } from 'react'
import DataTable from '../../common/DataTable/DataTable';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import useSearch from '../../../utils/hooks/useSearch';
import { deletePopup, formatDate } from '../../../utils/helpers';
import SearchBar from '../../common/SearchBar/SearchBar';
import ReloadButton from '../../common/ReloadButton/ReloadButton';
import EditButton from '../../common/EditButton/EditButton';
import DeleteButton from '../../common/DeleteButton/DeleteButton';
import { deleteActions } from '../../../actions/actions';

const {Title} = Typography;
function ListProduits() {
    const { data : produitsList , dataCopy  : produitsListCopy , setDataCopy : setProduitListCopy , onRefresh : refreshProduitsList, isLoading : produitsListLoading} = useFetch(endpoints.fiche_produit.LIST)
    const {getColumnSearchProps} = useSearch()
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);
    const onAdd = () => {
        setCurrentRecord(null);
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
            if (result.isConfirmed) {
                deleteActions(`${endpoints.fiche_produit.DELETE}/${record?.code_produit}`)
                .then((response)=>{
                    if (response?.data === true) {
                        message.success("Ligne retirée avec succès");
                        refreshProduitsList()
                    }
                })
            }
        })
    }
    return (
        <div>
            {/* <Title level={3} >Liste des produits</Title> */}

                

                <Flex justify="space-between" align="center" >

                    <Space>
                        <SearchBar 
                            data={produitsList}
                            setDataCopy={setProduitListCopy}
                            listKeys={['code_produit','libelle_produit','code_cip','qte_stock_mini']}
                        />
                    </Space>   
                    <Space>
                        <ReloadButton onRefresh={refreshProduitsList} /> 
                    </Space>
                </Flex>

                <br/>

                <DataTable compact
                    dataSource={produitsList}
                    dataSourceCopy={produitsListCopy}
                    setDataSourceCopy={setProduitListCopy}
                    tableLoading={produitsListLoading}
                    columns={[
                        {
                            title: 'N°',
                            dataIndex: 'code_produit',
                            key: 'code_produit',
                            ...getColumnSearchProps('code_produit')
                        },
                        {
                            title: 'Libellé',
                            dataIndex: 'libelle_produit',
                            key: 'libelle_produit',
                            sorter: (a, b) => a.libelle_produit.charCodeAt(0) - b.libelle_produit.charCodeAt(0),
                            ...getColumnSearchProps('libelle_produit')
                        },
                        {
                            title: 'Code cip',
                            dataIndex: 'code_cip',
                            key: 'code_cip',
                            ...getColumnSearchProps('code_cip')
                        },
                        {
                            title: 'Quantité en stock',
                            dataIndex: 'qte_stock_mini',
                            key: 'qte_stock_mini',
                            ...getColumnSearchProps('qte_stock_mini')
                        },
                        // {
                        //     title: 'Age',
                        //     dataIndex: 'age_patient',
                        //     key: 'age_patient',
                        //     sorter: (a, b) => a.age_patient - b.age_patient,
                        //     ...getColumnSearchProps('age_patient')
                        // },
                        // {
                        //     title: 'Sexe',
                        //     dataIndex: 'sexe_patient',
                        //     key: 'sexe_patient'
                        // },
                        // {
                        //     title: 'Type',
                        //     dataIndex: 'type_patient',
                        //     key: 'type_patient'
                        // },
                        // {
                        //     title: 'Date péremption',
                        //     dataIndex: 'date_per',
                        //     key: 'date_per',
                        //     render: (record) => <div className='table-data'>
                        //         <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                        //     </div>
                        // },
                        // {
                        //     title: 'Date de création',
                        //     dataIndex: 'date_creation',
                        //     key: 'date_creation',
                        //     render: (record) => <div className='table-data'>
                        //         <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                        //     </div>
                        // },
                        // {
                        {
                            width : 'auto' ,
                            render :  (record)=>(
                                <Flex justify="center" align="center" >
                                    <Space>
                                        <EditButton onEdit={()=>{onEdit(record)}} />
                                        <DeleteButton onDelete={()=>{ onDelete(record) }} />
                                    </Space>
                                </Flex>
                            )
                        }
                    ]}
                />
        </div>
    )
}

export default ListProduits