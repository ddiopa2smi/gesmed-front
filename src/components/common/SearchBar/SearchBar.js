import { SearchOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import React, { useRef } from 'react'

// Délai avant de lancer la recherche après la dernière frappe (évite de scanner
// tout le tableau à chaque caractère sur les listes volumineuses, ex: patients).
const DEBOUNCE_DELAY = 300;

const SearchBar = ({ data, setDataCopy, listKeys }) => {
    const debounceRef = useRef(null);

    const deepSearch = (object, searchedValue) => {
        const keys = listKeys;
        for (let index = 0; index < keys.length; index++) {
            const key = keys?.[index];
            if (String(object[key]).toLowerCase().indexOf(searchedValue.toLowerCase()) !== -1) {
                return true;
            }
        }
        return false;
    }

    const handleSearch = (inputValue) => {
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }
        debounceRef.current = setTimeout(() => {
            if (!inputValue) {
                setDataCopy(data);
                return;
            }
            const foundData = [];
            for (let index = 0; index < data.length; index++) {
                const element = data[index];
                if (deepSearch(element, inputValue)) {
                    foundData.push(element);
                }
            }
            setDataCopy(foundData);
        }, DEBOUNCE_DELAY);
    }

    return (
        <Input
            style={{ width: "300px" }}
            placeholder='Entrer votre recherche'
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
        />
    )
}

export default SearchBar