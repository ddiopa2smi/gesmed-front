import { Card, Tabs } from "antd";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AddDureeValidite from "../../components/specific/AddDureeValidite/AddDureeValidite";

function ConfigPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [currentTab, setCurrentTab] = useState(queryParams.get("tab") || "1");

  const onChangeTab = (key) => {
    setCurrentTab(key);
  };
  useEffect(() => {
    navigate(`${location.pathname}?tab=${currentTab}`);
    return () => {};
  }, [currentTab]);
  const items = [
    {
      key: "1",
      label: "Durée de validité prescription",
      children: <AddDureeValidite />,
    },
  ];
  return (
    <Card>
      <Tabs
        defaultActiveKey="1"
        onChange={(activeKey) => onChangeTab(activeKey)}
        activeKey={currentTab}
        items={items}
        tabPosition="left"
      />
    </Card>
  );
}

export default ConfigPage;
