import { SearchOutlined } from '@ant-design/icons';
import { Input , Button , Space, DatePicker, InputNumber } from 'antd';
import React, { useRef, useState } from 'react'
import Highlighter from 'react-highlight-words';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

function useSearch() {
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]); 
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };
    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
        <div
            style={{
            padding: 8,
            }}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <Input
                ref={searchInput}
                placeholder={`Rechercher ${dataIndex}`}
                value={selectedKeys[0]}
                onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                style={{
                    marginBottom: 8,
                    display: 'block',
                }}
            />
            <Space>
            <Button
                type="primary"
                onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                icon={<SearchOutlined />}
                size="small"
            >
                Rechercher
            </Button>
            <Button
                onClick={() => clearFilters && handleReset(clearFilters)}
                size="small"
            >
                Réinitialiser
            </Button>
            {/* <Button
                type="link"
                size="small"
                onClick={() => {
                confirm({
                    closeDropdown: false,
                });
                setSearchText(selectedKeys[0]);
                setSearchedColumn(dataIndex);
                }}
            >
                Filtrer
            </Button> */}
            <Button
                type="link"
                size="small"
                onClick={() => {
                close();
                }}
            >
                Fermer
            </Button>
            </Space>
        </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                color: filtered ? 'var(--second-color)' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => {
            
            if (record !== null && record !== undefined) {
                if (record[dataIndex]=== undefined || record[dataIndex] === null) {
                    return false
                }else{
                    return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                }
            }
        } ,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text) =>
        searchedColumn === dataIndex ? (
            <Highlighter
                highlightStyle={{
                    backgroundColor: '#ffc069',
                    padding: 0,
                }}
                searchWords={[searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : ''}
            />
        ) : (
            text
        ),
    });
    const getColumnDateSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <RangePicker
                    format="DD/MM/YYYY"
                    value={selectedKeys[0] || null}
                    onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => confirm()}
                        icon={<SearchOutlined />}
                        size="small"
                    >
                        Rechercher
                    </Button>
                    <Button
                        onClick={() => {
                            clearFilters && clearFilters();
                            confirm();
                        }}
                        size="small"
                    >
                        Réinitialiser
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        Fermer
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => {
            if (!value || !record || !record[dataIndex]) {
                return false;
            }
            const [start, end] = value;
            if (!start || !end) {
                return true;
            }
            const recordTime = dayjs(record[dataIndex]).valueOf();
            const startTime = dayjs(start).startOf('day').valueOf();
            const endTime = dayjs(end).endOf('day').valueOf();
            return recordTime >= startTime && recordTime <= endTime;
        },
    });

    const getColumnFilterProps = (dataIndex, dataSource) => {
        const values = Array.from(
            new Set((dataSource || []).map((item) => item?.[dataIndex]).filter(Boolean))
        );
        return {
            filters: values.map((value) => ({ text: value, value })),
            filterSearch: true,
            onFilter: (value, record) => record?.[dataIndex] === value,
        };
    };

    const getColumnRangeSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => {
            const [min, max] = selectedKeys[0] || [];
            return (
                <div
                    style={{
                        padding: 8,
                    }}
                    onKeyDown={(e) => e.stopPropagation()}
                >
                    <Space style={{ marginBottom: 8, display: 'block' }}>
                        <InputNumber
                            placeholder="Min"
                            style={{ width: 100 }}
                            value={min}
                            onChange={(value) => setSelectedKeys([[value, max]])}
                            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        />
                        <InputNumber
                            placeholder="Max"
                            style={{ width: 100 }}
                            value={max}
                            onChange={(value) => setSelectedKeys([[min, value]])}
                            onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        />
                    </Space>
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                            icon={<SearchOutlined />}
                            size="small"
                        >
                            Rechercher
                        </Button>
                        <Button
                            onClick={() => clearFilters && handleReset(clearFilters)}
                            size="small"
                        >
                            Réinitialiser
                        </Button>
                        <Button
                            type="link"
                            size="small"
                            onClick={() => {
                                close();
                            }}
                        >
                            Fermer
                        </Button>
                    </Space>
                </div>
            );
        },
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? 'var(--second-color)' : undefined,
                }}
            />
        ),
        onFilter: (value, record) => {
            const [min, max] = value || [];
            const numValue = Number(record?.[dataIndex]);
            if (record?.[dataIndex] === undefined || record?.[dataIndex] === null || isNaN(numValue)) {
                return false;
            }
            if (min !== undefined && min !== null && numValue < min) {
                return false;
            }
            if (max !== undefined && max !== null && numValue > max) {
                return false;
            }
            return true;
        },
    });

    return {getColumnSearchProps, getColumnDateSearchProps, getColumnFilterProps, getColumnRangeSearchProps}
}

export default useSearch