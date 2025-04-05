import {
  ExportOutlined,
  PlusOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import {
  Button,
  Card,
  Flex,
  Space,
  Tooltip,
  Typography,
} from "antd";
import React, { useState } from "react";
import DataTable from "../../components/common/DataTable/DataTable";
import useFetch from "../../utils/hooks/useFetch";
import { endpoints } from "../../constants/endpoints.constants";
import useSearch from "../../utils/hooks/useSearch";
import SearchBar from "../../components/common/SearchBar/SearchBar";

const { Title } = Typography;

function SituationStocks() {
  const {
    data: stocksList,
    dataCopy: stocksListCopy,
    setDataCopy: setStocksListCopy,
    isLoading,
    onRefresh,
  } = useFetch(endpoints.situation_stock.LIST);
  const [selectedRows, setSelectedRows] = useState([]);
  const { getColumnSearchProps } = useSearch();

  return (
    <Card>
      <Title level={3}>Situation des stocks</Title>

      <br />

      <Flex justify="space-between" align="center">
        <SearchBar
          data={stocksList}
          setDataCopy={setStocksListCopy}
          listKeys={["code_produit", "libelle_produit", "qte_stock_th"]}
        />
        <Space>
          <Tooltip title="Actualiser">
            <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} />
          </Tooltip>
          <Button type="primary" icon={<ExportOutlined />}>
            Exporter
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            Ajouter
          </Button>
        </Space>
      </Flex>

      <br />

      <DataTable
        tableLoading={isLoading}
        dataSource={stocksList || []}
        dataSourceCopy={stocksListCopy || []}
        setDataSourceCopy={setStocksListCopy}
        rowKey={(record) => record.code_produit}
        rowSelected
        selectedRowKeys={selectedRows}
        setSelectedRowKeys={setSelectedRows}
        columns={[
          {
            title: "Code",
            dataIndex: "code_produit",
            key: "code_produit",
            ...getColumnSearchProps("code_produit"),
          },
          {
            title: "Désignation",
            dataIndex: "libelle_produit",
            key: "libelle_produit",
            ...getColumnSearchProps("libelle_produit"),
          },
          {
            title: "Stock théorique",
            dataIndex: "qte_stock_th",
            key: "qte_stock_th",
            ...getColumnSearchProps("qte_stock_th"),
          }
        ]}
      />
    </Card>
  );
}
    
export default SituationStocks;
