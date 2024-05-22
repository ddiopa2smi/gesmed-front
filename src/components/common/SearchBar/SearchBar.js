import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React from 'react'

const SearchBar = ({data , setDataCopy , listKeys}) => {
    const handleSearch = (inputValue) => {
        const foundData = [];
        for (let index = 0; index < data.length; index++) {
        const element = data[index];
        if (deepSearch(element, inputValue)) {
            foundData.push(element);
        }
        }
        setDataCopy(foundData)
    }

    const deepSearch = (object, searchedValue) =>{
        const keys = listKeys;
        for (let index = 0; index < keys.length; index++) {
        const key = keys?.[index];
        if (String(object[key]).toLowerCase().indexOf(searchedValue.toLowerCase()) !== -1) {
            return true;
        }
        }
        return false;
    }

    return (
        <Input 
            style={{width:"300px"}}
            placeholder='Entrer votre recherche'
            prefix={<SearchOutlined />}
            onChange={(e)=>handleSearch(e.target.value)}
        />
    )
}

export default SearchBar