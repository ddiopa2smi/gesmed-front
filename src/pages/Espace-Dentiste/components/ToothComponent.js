import React, { useState } from 'react'
import "./ToothComponent.scss"
import { Button } from 'antd';

const teethItems = Array.from({ length: 32 }, (_, index) => ({
  key: index + 1,
  isSelected: false,
  transformPosition: index * 11.3
}));
function ToothComponent() {

  const [items , setItems] = useState(teethItems);
    
  
    return (
        <div className='circle-container' >
            {
              items.map((item , index)=>(
                <Button 
                  onClick={()=>{
                    let copyItems = [...items]
                    copyItems.forEach(element => {
                      if (element.key === item.key) {
                        if (element.isSelected) {
                          element.isSelected = false
                        }else{
                          element.isSelected = true
                        }
                      }
                    });
                    setItems([...copyItems])
                  }} 
                  className="icon" 
                  size="small"
                  type='text' 
                  key={index} 
                  style={{"transform": `rotate(${item.transformPosition}deg) translate(200px) rotate(${item.transformPosition === 0 ? item.transformPosition : (-item.transformPosition) }deg)` }} 
                >
                  <svg
                    fill="currentColor"
                    height="24"
                    width="24"
                  >
                    <path color={item.isSelected && 'var(--app-color)'} d="M7 2C4 2 2 5 2 8c0 2.11 1 5 2 6s2 8 4 8c4.54 0 2-7 4-7s-.54 7 4 7c2 0 3-7 4-8s2-3.89 2-6c0-3-2-6-5-6s-3 1-5 1-2-1-5-1m0 2c2 0 3 1 5 1s3-1 5-1c1.67 0 3 2 3 4 0 1.75-.86 4.11-1.81 5.06-.86.86-2.13 6.88-2.69 6.88-.21 0-.5-1.06-.5-2.35 0-2.04-.57-4.59-3-4.59s-3 2.55-3 4.59c0 1.29-.29 2.35-.5 2.35-.56 0-1.83-6.02-2.69-6.88C4.86 12.11 4 9.75 4 8c0-2 1.33-4 3-4z" />
                  </svg>  
                </Button>
              ))
            }
        </div>

    )
}

export default ToothComponent