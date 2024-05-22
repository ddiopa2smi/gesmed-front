// import { Button, Flex, Form, Input, InputNumber, Space, Typography, Popconfirm, Tabs } from 'antd'
// import React, { useState } from 'react'
// import EditButton from '../EditButton/EditButton'
// import DeleteButton from '../DeleteButton/DeleteButton'
// import useSearch from '../../../utils/hooks/useSearch'
// import DataTable from '../DataTable/DataTable'

// function CrudComponent({dataSource}) {
//   const [data, setData] = useState(dataSource);
//   const [form] = Form.useForm()
//   const {getColumnSearchProps} = useSearch()
//   const [editingKey, setEditingKey] = useState('');

//   const save = () => {
    
//   }

//   const onEdit = (record) => {
//     // setOperationType("update");
//     // setOpen(true);
//     // setCurrentRecord({...record});
//   }

//   const onDelete = (record) => {
//       // deletePopup()
//       // .then((result)=>{
//       //     if (result.isConfirmed) {
//       //         deleteActions(`${endpoints.patients.DELETE}/${record?.num_patient}`)
//       //         .then((response)=>{
//       //             if (response.data.Deleted === true) {
//       //                 message.success("Ligne retirée avec succès");
//       //                 onRefresh()
//       //             }
//       //         })
//       //     }
//       // })
//   }

//   const cancel = () => {
//     setEditingKey('');
//   };
  
//   const isEditing = (record) => record.key === editingKey;
//   const edit = (record) => {
//     form.setFieldsValue({
//       ...record,
//     });
//     setEditingKey(record.key);
//   };

//   const EditableCell = ({
//     editing,
//     dataIndex,
//     title,
//     inputType,
//     record,
//     index,
//     children,
//     ...restProps
//   }) => {
//     const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
//     return (
//       <td {...restProps}>
//         {editing ? (
//           <Form.Item
//             name={dataIndex}
//             style={{
//               margin: 0,
//             }}
//             rules={[
//               {
//                 required: true,
//                 message: `Please Input ${title}!`,
//               },
//             ]}
//           >
//             {inputNode}
//           </Form.Item>
//         ) : (
//           children
//         )}
//       </td>
//     );
//   };

  
//   return (
//     <div>
      
//       <Form
//           form={form}
//           layout="vertical"
//           onFinish={save}
//       >
//           <Space>
//             <Form.Item
//                 name="libelle_patho"
//                 label="Libellé"
//                 rules={[
//                     {
//                         required: true,
//                         message: 'Champ obligatoire',
//                     },
//                 ]}
                
//             >
//                 <Input/>
//             </Form.Item>
//             <Button type='primary' htmlType='submit' >Enregistrer</Button>
//           </Space>
          
          
//           {/* <FormFooter 
//               onCancel={()=>{setOpen(false)}}
//               loading={loading}
//               htmlType='submit'
//           /> */}

          
        
//       </Form>

//       <Form
//           form={form}
//           layout="vertical"
//           onFinish={save}
//           component={false}
//       >
//           <DataTable 
//             dataSource={data.data}
//             dataSourceCopy={data.data}
//             // setDataSourceCopy={setDataCopy}
//             // tableLoading={isLoading}
//             rowKey={(record)=>record.code_patho}
//             components={{
//               body: {
//                 cell: EditableCell,
//               },
//             }}
//             pagination={{pageSize : 5}}
//             //rowSelected
//             columns={[
//                 {
//                     title: 'Libellé',
//                     dataIndex: 'libelle_patho',
//                     key: 'libelle_patho',
//                     editable: true,
//                     ...getColumnSearchProps('libelle_patho')
//                 },
                
//                 {
//                     // render :  (record)=>(
//                     //     <Flex align='center' >
//                     //         <Space>
//                     //             <EditButton onEdit={()=>{onEdit(record)}} />
//                     //             <DeleteButton onDelete={()=>{ onDelete(record) }} />
//                     //         </Space>
//                     //     </Flex>
//                     // ) ,
//                     render: (_, record) => {
//                       const editable = isEditing(record);
//                       return editable ? (
//                         <span>
//                           <Typography.Link
//                             onClick={() => save(record.key)}
//                             style={{
//                               marginRight: 8,
//                             }}
//                           >
//                             Save
//                           </Typography.Link>
//                           <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
//                             <a>Cancel</a>
//                           </Popconfirm>
//                         </span>
//                       ) : (
//                         // <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
//                         //   Edit
//                         // </Typography.Link>
//                         <Flex align='center' >
//                             <Space>
//                                 <EditButton onEdit={()=>{edit(record)}} />
//                                 <DeleteButton onDelete={()=>{ onDelete(record) }} />
//                             </Space>
//                         </Flex>
//                       );
//                     },
              
//                 },
                
//             ]}
//         />

          
        
//       </Form>

      

      
//     </div>
//   )
// }

// export default CrudComponent


import React, { useEffect, useState } from 'react';
import { Button, Form, Input, InputNumber, Popconfirm, Space, Table, Typography, message } from 'antd';
import useSearch from '../../../utils/hooks/useSearch';
import { CheckCircleFilled, CloseCircleFilled, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import useFetch from '../../../utils/hooks/useFetch';
import { endpoints } from '../../../constants/endpoints.constants';
import { getActions, putActions } from '../../../actions/actions';
import ReloadButton from '../ReloadButton/ReloadButton';
// const originData = [];
// for (let i = 0; i < 100; i++) {
//   originData.push({
//     key: i.toString(),
//     name: `Edward ${i}`,
//     age: 32,
//     address: `London Park no. ${i}`,
//   });
// }
const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};
const CrudComponent = ({dataSource}) => {
  dataSource.forEach(element => {
    element.key = element.code_patho
  });
  const [form] = Form.useForm();
  // const [data, setData] = useState(dataSource);
  const {data , setData , dataCopy , setDataCopy ,  isLoading , onRefresh } = useFetch(endpoints.pathologie.LIST);
  data.forEach(element => {
    element.key = element.code_patho
  });
  const [editingKey, setEditingKey] = useState('');
  const isEditing = (record) => record.key === editingKey;
  const {getColumnSearchProps} = useSearch()
  const edit = (record) => {
    console.log(record.key)
    form.setFieldsValue({
      key : record.code_patho ,
      libelle_patho: '',
      ...record,
    });
    setEditingKey(record.key);
  };
  const cancel = () => {
    setEditingKey('');
  };
  const save = async (record) => {
    //console.log(record)
    putActions(endpoints.pathologie.UPDATE,record)
    .then((response)=>{
        if (response.data.Updated === true) {
            //setLoading(false);
            message.success("Modification effectuée avec succès");
            setEditingKey("")
            onRefresh();
            //form.resetFields(); 
        }
    })
    // console.log(key)
    // try {
    //   const row = await form.validateFields();
    //   const newData = [...data];
    //   const index = newData.findIndex((item) => key === item.key);
    //   if (index > -1) {
    //     const item = newData[index];
    //     newData.splice(index, 1, {
    //       ...item,
    //       ...row,
    //     });
    //     setData(newData);
    //     setEditingKey('');
    //   } else {
    //     newData.push(row);
    //     setData(newData);
    //     setEditingKey('');
    //   }
    // } catch (errInfo) {
    //   console.log('Validate Failed:', errInfo);
    // }
  };
  const onDelete = (id) => {

  }
  const columns = [
    {
      title: 'Libellé',
      dataIndex: 'libelle_patho',
      editable: true,
      ...getColumnSearchProps('libelle_patho')
    },
    {
      width: '25%',
      title: 'Actions',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space align='center'>
            <Button type='text' onClick={cancel} icon={<CloseCircleFilled />} danger />
            <Button type='text' onClick={() => save(record)} icon={<CheckCircleFilled style={{color:"green"}}  />} />
          </Space>
        ) : (
          <Space>
            <Button type='text' disabled={editingKey !== ''} onClick={() => edit(record)} icon={<EditOutlined style={{color:"green"}} />} />
            
            <Popconfirm title="Sûr de supprimer?" onConfirm={() => onDelete(record)}>
              <Button type='text' icon={<DeleteOutlined />} danger /> 
            </Popconfirm>
          </Space>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  return (
    <div>
      <Space>
        <ReloadButton onRefresh={onRefresh} /> 
      </Space>
      <Form form={form} component={false}>
        <Table
          loading={isLoading}
          components={{
            body: {
              cell: EditableCell,
            },
          }}
          bordered
          dataSource={data}
          columns={mergedColumns}
          rowClassName="editable-row"
          pagination={{
            onChange: cancel,
            pageSize : 5
          }}
        />
      </Form>
    </div>
  );
};
export default CrudComponent;