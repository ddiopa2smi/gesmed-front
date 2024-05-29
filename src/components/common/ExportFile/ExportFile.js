import React, { useEffect, useState } from 'react'
import ExcelExport from 'export-xlsx';
import { Button ,Popover,Tooltip,Tree, Typography } from 'antd';
import { ExportOutlined } from '@ant-design/icons'
import FormFooter from '../FormFooter/FormFooter';

const {Text} = Typography;

function ExportFile({ setOpen , title , data}) {
    //const [open, setOpen] = useState(false);
    const [header , setHeader]  = useState([]);

    // const handleOpenChange = (newOpen) => {
    //   setOpen(newOpen);
    // };

    const getMaxObjectLength = () => {
        if (data) {
            let initValue = (Object.keys(data[0])).length ;
            let finalIndex = 0;
            data.forEach((element , index) => {
                if ((Object.keys(element)).length > initValue ) {
                    finalIndex = index;
                }
            });
            return finalIndex;
        }
    }

    const getObjectModel = () => {
        if (data) {
            const maxObjectLength = getMaxObjectLength();
            const headerDefinition = [];
           
            for (const element of Object.entries(data[maxObjectLength])) {
                const key = element[0];
                if (header.length !== 0) {
                    header.forEach(element => {
                        if (key === element) {
                            let object = {};
                            object.name = key;
                            object.key = key;
                            object.width = 25;
                            object.hierarchy = true;
                            object.checkable = true;
                            headerDefinition.push(object)
                        }
                    });
                }   
            }

            return headerDefinition;
        }
    }

    
    const handleExportFile = () => {
        if (data) {
            const headerDefinition = getObjectModel();
            const SETTINGS_FOR_EXPORT = {
                fileName: title || 'Modèle d\'import des données',
                workSheets: [
                    {
                        sheetName: 'Modèle',
                        startingRowNumber: 1,
                        gapBetweenTwoTables: 2,
                        tableSettings: {
                            data: {
                                importable: true,
                                headerDefinition:  headerDefinition
                            },
                        },
                    },
                ],
            };  
            
            const excelExport = new ExcelExport();
            excelExport.downloadExcel(SETTINGS_FOR_EXPORT, [{data:data}]);
            setOpen(false);
        }
    }


    const getTreeData = () =>{
        if (data) {
            const temp = [];
            const maxObjectLength = getMaxObjectLength();
            for (const element of Object.entries(data[maxObjectLength])) {
                const key = element[0];
                let object={};
                object.title = key;
                object.key = key ;
                temp.push(object)
            }
            return temp ;
        }
    }

    const treeData = getTreeData();
    

    const onCheck = (checkedKeys) => {
        setHeader(checkedKeys);
    };

    useEffect(() => {
        let temp = [];
        for (let i = 0; i < treeData.length; i++) {
            const element = treeData[i];
            temp.push(element.key);
        }
        setHeader(temp);
    
    }, [])
    

    return (
        data.length !== 0 &&
        <>
            <Text>Vous avez la possibilité de sélectionner uniquement les champs à afficher dans le document</Text>
            <br/>
            <br/>
            <Tree
                checkable
                onCheck={onCheck}
                checkedKeys={header}
                treeData={treeData}
                selectable={false}
                //height={300}
            />  
            <br/>
            <FormFooter 
                onCancel={()=>{setOpen(false)}}
                onValid={handleExportFile}
                validLabel={"Exporter"}
            /> 
        </>
        // data.length !== 0 ?
        // <Popover
        //     placement='bottom'
        //     content={
        //         <Tree
        //             checkable
        //             onCheck={onCheck}
        //             checkedKeys={header}
        //             treeData={treeData}
        //             selectable={false}
        //             height={300}
        //         />    
        //     }
        //     title={
        //         <div style={{width:'100%',display:"flex",justifyContent:'space-evenly',alignItems:"center",marginTop: 10 }} >
        //             <Text>Exporter le document</Text>
        //             <Button onClick={handleExportFile}  type={"primary"} size={"small"} >Valider</Button>
        //         </div>
        //     }
        //     trigger="click"
        //     open={open}
        //     onOpenChange={handleOpenChange}
        //     overlayStyle={{
        //         width : 350 ,
        //         height  : 300
        //     }}
                
        // >
        //     <Tooltip title="Exporter" >
        //         <Button type='text' shape="circle" icon={<ExportOutlined/>} onClick={()=>{console.log("export")}} />
        //     </Tooltip> 
        // </Popover>
        // :
        // <Button type='primary' icon={<ExportOutlined/>}> Exporter </Button>
    )
}

export default ExportFile