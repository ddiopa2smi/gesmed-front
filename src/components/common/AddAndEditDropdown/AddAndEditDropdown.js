import { EditOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Dropdown, Flex } from 'antd'

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
            <Button type="text" size='small' style={{marginLeft : 4}} >
                <div>
                    <PlusOutlined  />
                    <EditOutlined  />
                </div>
            </Button>
            
        </Dropdown>
    </Flex>
  )
}

export default AddAndEditDropdown