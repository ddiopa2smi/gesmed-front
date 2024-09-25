import { Button, Card, Flex, Typography } from "antd";
import React from "react";
const { Text, Title } = Typography;
function Home() {
  return (
    <Card>
      {/* <Text>Bienvenue sur votre espace d' Analyse</Text> */}
      <Title level={3}>Liste des analyses à faire</Title>

      <Flex align="center" justify="space-between">
        <Title level={3}>Liste des analyses à faire</Title>
        <Button>Actualiser</Button>
      </Flex>
    </Card>
  );
}

export default Home;
