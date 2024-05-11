import { ReloadOutlined } from '@ant-design/icons';
import { Button, Flex, Space, Tooltip, Typography } from 'antd'
import React from 'react'
import DataTable from '../../common/DataTable/DataTable';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import useSearch from '../../../utils/hooks/useSearch';
import { formatDate } from '../../../utils/helpers';

const {Title} = Typography;
function ListProduits() {
    const { data : produitsList , dataCopy  : produitsListCopy , setDataCopy : setProduitListCopy , onRefresh : refreshProduitsList, isLoading : produitsListLoading} = useFetch()
    const {getColumnSearchProps} = useSearch()
    return (
        <div>
            {/* <Title level={3} >Liste des produits</Title> */}

                <Flex justify="flex-end" align="center" >
                    <Space>
                        {/* <Tooltip title="Recherche avancée" >
                            <Button type='text' shape="circle" icon={<SearchOutlined/>} onClick={onDisplayAdvancedSearch} /> &nbsp;&nbsp;
                        </Tooltip> 
                        <Tooltip title="Exporter" >
                            <Button type='text' shape="circle" icon={<ExportOutlined/>} onClick={onExport} /> &nbsp;&nbsp;
                        </Tooltip> 	 */}
                        {/* {
                            //tableLoading === false &&
                            dataSourceCopy.length !== 0 &&
                            <>
                                <ExportFile title={title} data={dataSourceCopy} /> &nbsp;&nbsp;
                            </>
                        } */}
                        <Tooltip title="Actualiser" >
                            <Button type='text' shape="circle" icon={<ReloadOutlined/>} onClick={refreshProduitsList} /> &nbsp;&nbsp;
                        </Tooltip> 
                        {/* <Button type='primary' icon={<PlusOutlined/>} onClick={onAdd} >Ajouter</Button> */}
                    </Space>
                </Flex>

                <br/>

                <DataTable 
                    dataSource={produitsList}
                    dataSourceCopy={produitsListCopy}
                    setDataSourceCopy={setProduitListCopy}
                    tableLoading={produitsListLoading}
                    columns={[
                        {
                            title: 'N°',
                            dataIndex: 'num_produit',
                            key: 'num_produit',
                            ...getColumnSearchProps('num_produit')
                        },
                        {
                            title: 'Nom',
                            dataIndex: 'nom_produit',
                            key: 'nom_produit',
                            sorter: (a, b) => a.nom_produit.charCodeAt(0) - b.nom_produit.charCodeAt(0),
                            ...getColumnSearchProps('nom_produit')
                        },
                        // {
                        //     title: 'Prénom',
                        //     dataIndex: 'prenom_patient',
                        //     key: 'prenom_patient',
                        //     ...getColumnSearchProps('prenom_patient')
                        // },
                        // {
                        //     title: 'Téléphone',
                        //     dataIndex: 'tel_patient',
                        //     key: 'tel_patient',
                        //     ...getColumnSearchProps('tel_patient')
                        // },
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
                        {
                            title: 'Date péremption',
                            dataIndex: 'date_per',
                            key: 'date_per',
                            render: (record) => <div className='table-data'>
                                <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                            </div>
                        },
                        {
                            title: 'Date de création',
                            dataIndex: 'date_creation',
                            key: 'date_creation',
                            render: (record) => <div className='table-data'>
                                <span style={{textOverflow:"ellipsis"}} > {formatDate(record)} </span>
                            </div>
                        },
                        // {
                        //     render :  (record)=>(
                        //         <Flex align='center' >
                        //             <Dropdown
                        //                 menu={{items :  
                        //                     [
                        //                         {
                        //                             label: <span style={{textOverflow:"ellipsis"}} > <FolderOutlined/> Ouvrir Dossier Médical </span> ,
                        //                             key: '0',
                        //                             onClick : ()=>{onOpenMedicalFolder(record)},
                        //                         },
                        //                         {
                        //                             label: <span> <ClockCircleOutlined/> Créer RV</span> ,
                        //                             key: '1',
                        //                             onClick : ()=>{onCreateRV(record)} ,
                        //                         },
                        //                         {
                        //                             label: <span> <EditOutlined/> Modifier </span>,
                        //                             key: '2',
                        //                             onClick : ()=>{onEdit(record)} , 
                        //                         }, 
                        //                         {
                        //                             label: <span> <DeleteOutlined/> Supprimer</span> ,
                        //                             key: '3',
                        //                             onClick : ()=>{onDelete(record)}
                        //                         },
                        //                     ]
                        //                 }}
                        //                 trigger={['click']}
                        //             >
                        //                 <Button type='text' shape='circle' icon={<MoreOutlined/>} />
                        //             </Dropdown>
                        //         </Flex>
                        //     )
                        // }
                    ]}
                />
        </div>
    )
}

export default ListProduits