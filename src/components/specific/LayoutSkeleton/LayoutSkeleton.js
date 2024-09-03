import { Flex, Layout, Skeleton, Space, Typography } from 'antd'
import React from 'react'
import "./LayoutSkeleton.scss"
import { LoadingOutlined, MenuFoldOutlined } from '@ant-design/icons';
const { Header, Sider, Content } = Layout;
const  {Text} = Typography;
function LayoutSkeleton() {
    let screenWidth = window.innerWidth;
    return (
        <div className="MySpaceWrapper">
            <Layout>
                {/* <div className='sider-container' style={{height:"100vh"}} >
                    <Sider style={{
                            overflow:"auto",
                            maxHeight:"100%",
                            flex : "0 0 208px",
                            boxSizing:"border-box",
                            position : "fixed",
                            top : 56,
                            left : 0,
                            bottom: 0,
                            zIndex : 2
                            
                        }} 
                        theme="light" 
                        trigger={null} 
                        collapsible 
                        //collapsed={collapsed}
                        //width={250}
                        width={"20%"}
                    >
                            
                        <Space direction='vertical' size="large" style={{width:"100%", padding : 12}} >
                            <Skeleton.Input active  block />
                            <Skeleton.Input active  block />
                            <Skeleton.Input active  block />
                            <Skeleton.Input active  block />
                            <Skeleton.Input active  block />
                        </Space>
                    </Sider>
                </div>  */}
                <Layout className="site-layout">
                    <Header
                        className='header'
                        style={{background:"transparent"}}
                    >
                        <div style={{display:"flex",justifyContent:"center",alignItems:"center",width : "25%",transition : "all ease-in 0.2s"}} >
                            <Skeleton.Input active />
                        </div>
                        <div style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between"}} >
                            <Flex align='center' >
                                <Skeleton.Button active />
                            </Flex>
                            <div className='header-right'>
                                <Space size="large" >
                                    <Skeleton.Button active  />
                                    <Skeleton.Button active  />
                                    <Skeleton.Avatar active  />
                                </Space>
                            </div>
                        </div>
                        
                    </Header>
                    
                    <Content className='content' style={{marginLeft: screenWidth > 992 ? "20%" : 0}} >
                        {/* <Breadcrumb items={breadCrumbItems}/>  */}
                        <Skeleton.Button active />
                        <br/>
                        <center>
                            <Skeleton.Node active > <LoadingOutlined /> </Skeleton.Node>
                        </center>
                        <div className='footer'>
                            <Skeleton.Input active block />
                        </div>
                    </Content>

                </Layout>
            </Layout>
        </div>
    )
}

export default LayoutSkeleton