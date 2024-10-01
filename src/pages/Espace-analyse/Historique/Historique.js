import { Button, Card, Flex, List, Popconfirm, Space, Typography } from "antd";
import React, { useState } from "react";
import { formatDate } from "../../../utils/helpers";
import { ReloadOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";

const { Title, Text } = Typography;
function Historique() {
  const [loading, setLoading] = useState(false);
  const [refetch, setRefetch] = useState(0);
  const navigate = useNavigate();
  const historique = [
    {
      numpresc: "ANA01213",
      datepresc: new Date().toISOString(),
      prescripteur: "ddiop",
      traite: true,
      author: "Mr Derick",
    },
    {
      numpresc: "ANA01214",
      datepresc: new Date().toISOString(),
      prescripteur: "david",
      traite: true,
      author: "Mde Fatou",
    },
    {
      numpresc: "ANA01215",
      datepresc: new Date().toISOString(),
      prescripteur: "david",
      traite: true,
      author: "Anta MBACKE",
    },
    
  ];

  const viewDetails = (id) => {
    navigate(`/espace-analyse/historique/details/${id}`);
  };
  const onRefresh = () => {
    setRefetch(Date.now());
  };
  return (
    <Card>
      <Flex justify="space-between" flex={1} align="center">
        <Title level={3}>Historique de consultations</Title>
        <Space>
          <Button
            type="primary"
            onClick={onRefresh}
            icon={<ReloadOutlined />}
            ghost
          />
        </Space>
      </Flex>
      <List
        loading={loading}
        // pagination={{
        //     onChange: (page  : number , pageSize : number) => {
        //         setPageNumber(page);
        //         setPageSize(pageSize);
        //     },
        //     pageSize: pageSize,
        //     total : totalRecords,
        //     showTotal : ()=> <> Total : {totalRecords} </>,
        //     showSizeChanger : true ,
        //     pageSizeOptions : [1, 2, 10, 20, 50, 100],
        //     onShowSizeChange : (current:number, size : number) => {
        //         setPageSize(size);
        //     }
        // }}
        dataSource={historique}
        renderItem={(item) => (
          <List.Item
            key={item.numpresc}
            actions={[
              <a
                key="list-loadmore-edit"
                onClick={() => {
                  viewDetails(item.numpresc);
                }}
              >
                Voir résultat
              </a>,
              <Popconfirm
                title="Supprimer l'élément ?"
                description="Etes-vous sûr?"
                onConfirm={() => {
                  console(item?.id);
                }}
                okText="Oui"
                cancelText="Non"
              >
                <a key="list-loadmore-more">Supprimer</a>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={<Text> Analyse {item?.numpresc} </Text>}
              description={`Fait par ${item?.author}  le ${formatDate(
                item?.datepresc
              )} sous prescription de ${item?.prescripteur}`}
            />
          </List.Item>
        )}
      />
    </Card>
  );
}

export default Historique;
