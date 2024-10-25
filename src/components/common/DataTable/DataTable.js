import { Table } from 'antd';
import React, { useState } from 'react'


function DataTable({

    dataSource,
    dataSourceCopy,
    tableLoading,
    rowKey,
    columns,
    rowSelected,
    pagination,
    components,
    selectedRowKeys = [],
    setSelectedRowKeys
}) {

    const [tableCount , setTableCount] = useState(null);
    //const [selectedRowKeys , setSelectedRowKeys] = useState([]);
    const [sortedInfo, setSortedInfo] = useState({});

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };    

    let rowSelection = {
        selectedRowKeys : selectedRowKeys ,
        onChange: onSelectChange ,  
        selections: [
          Table.SELECTION_ALL,
          Table.SELECTION_INVERT,
          Table.SELECTION_NONE,
          {
            key: 'odd',
            text: 'Select Odd Row',
            onSelect: (changableRowKeys) => {
              let newSelectedRowKeys = [];
              newSelectedRowKeys = changableRowKeys.filter((_, index) => {
                return index % 2 === 0;
              });
              setSelectedRowKeys(newSelectedRowKeys);
            },
          },
          {
            key: 'even',
            text: 'Select Even Row',
            onSelect: (changableRowKeys) => {
              let newSelectedRowKeys = [];
              newSelectedRowKeys = changableRowKeys.filter((_, index) => {
                return index % 2 !== 0;
              });
             
              setSelectedRowKeys(newSelectedRowKeys);
            },
          },
        ],
    };
    return (
        <Table 
            onChange={(pagination, filters, sorter, extra)=>{
                setTableCount(extra.currentDataSource.length);
                //setFilteredInfo(filters);
                setSortedInfo(sorter);
            }}
            rowSelection={rowSelected && rowSelection}
            columns={columns} 
            loading={tableLoading}  
            dataSource={dataSourceCopy} 
            rowKey={rowKey}
            //size="middle"
            size="small"
            scroll={window.screen.width < 1200 && {
                x : 1000,
            }}
            components={components}
            pagination={pagination}
            footer={()=> selectedRowKeys?.length !== 0 ? `${selectedRowKeys?.length}/${dataSourceCopy.length} ligne(s) sélectionné(es)` :  `${dataSourceCopy?.length} lignes au total`}
        />
    )
}

export default DataTable