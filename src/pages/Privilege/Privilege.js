import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, Flex, Form, Modal, Space, Tabs, Tag, Tooltip, Tree, Typography } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import DataTable from '../../components/common/DataTable/DataTable';
import useFetch from '../../utils/hooks/useFetch';
import { endpoints } from '../../constants/endpoints.constants';
import { deletePopup } from '../../utils/helpers';
import AddPrivilege from '../../components/specific/AddPrivilege/Addprivilege';
import { Link } from 'react-router-dom';
import FormFooter from '../../components/common/FormFooter/FormFooter';


const {Title} = Typography;
    
function Privilege() {
    const navigate = useNavigate();
    const userConnected  = JSON.parse(sessionStorage.getItem("userConnected"));
    const [open , setOpen] = useState(false);
    const [operationType , setOperationType] = useState("");
    const [currentRecord , setCurrentRecord] = useState(null);
    const [form] = Form.useForm();
    const [permissions ,setPermissions] = useState([]);

    const treeList = [
        {
            title : "Compte",
            key : "account",
            children : [
                {
                    title : "Créer",
                    key : "create-account"
                },
                {
                    title: 'Lire',
                    key: 'read-account',
                },
                {
                    title: 'Modifier',
                    key: 'update-account',
                },
                {
                    title: 'Supprimer',
                    key: 'delete-account',
                },
            ]
        },
        {
            title : "Guest",
            key : "guest",
            children : [
                {
                    title : "Créer",
                    key : "create-guest"
                },
                {
                    title: 'Lire',
                    key: 'read-guest',
                },
                {
                    title: 'Modifier',
                    key: 'update-guest',
                },
                {
                    title: 'Supprimer',
                    key: 'delete-guest',
                },
            ]
        },
    ]
    
    
    const onCheck = (checkedKeys, info) => {
        console.log('onCheck', checkedKeys, info);
        setPermissions(checkedKeys);
    };

    const valid = () => {
        
    }

    return (
        <Card>
                
            <Title level={3} >Privilège </Title>

            {/* <Form
                form={form}
                layout="vertical"
                name="privileges_form"
                //onFinish={save}
                style={{
                    width:"100%"
                }}
            >
                <Tree
                    checkable
                    // defaultExpandedKeys={['0-0-0', '0-0-1']}
                    // defaultSelectedKeys={['0-0-0', '0-0-1']}
                    defaultCheckedKeys={currentRecord?.privileges}
                    onCheck={onCheck}
                    treeData={treeList}
                    selectable={false}
                    multiple={true}
                />

                <br/>
                <FormFooter 
                    onCancel={null}
                    onValid={valid}
                />
            </Form> */}


            <Form
                form={form}
                layout="vertical"
                name="privileges_form"
                //onFinish={save}
                style={{
                    width:"100%"
                }}
            >
                <Tree
                    checkable
                    // defaultExpandedKeys={['0-0-0', '0-0-1']}
                    // defaultSelectedKeys={['0-0-0', '0-0-1']}
                    defaultCheckedKeys={currentRecord?.privileges}
                    onCheck={onCheck}
                    treeData={treeList}
                    selectable={false}
                    multiple={true}
                />

                <br/>
                <FormFooter 
                    onCancel={null}
                    onValid={valid}
                />
            </Form>
            
        </Card>
    )
}

export default Privilege