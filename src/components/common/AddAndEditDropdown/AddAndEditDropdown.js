import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Dropdown, Flex } from 'antd'

function AddAndEditDropdown({items}) {
  return (
    <Flex justify='center' align='center' >
        <Dropdown
            menu={{
                items : items ,
            }}
            trigger={['click']}     
            arrow
        >
            <div style={{cursor:"pointer"}} >
                <PlusOutlined style={{fontSize:14}} />
                <EditOutlined style={{fontSize:14}} />
            </div>
        </Dropdown>
    </Flex>
  )
}

export default AddAndEditDropdown