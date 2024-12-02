import { Calendar, Card, Typography, Modal, Avatar, Tooltip, Tabs, Flex } from "antd";
import React, { useEffect, useState } from "react";
import useFetch from "../../../utils/hooks/useFetch.js";
import { endpoints } from "../../../constants/endpoints.constants.js";
import DayAppointment from "../DayAppointment/DayAppointment.tsx";
import ReloadButton from "../../common/ReloadButton/ReloadButton.js";

const { Title } = Typography;

function AgendaComponent({ author, serviceType }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, onRefresh } = useFetch(endpoints.rendezVous.LIST);
  const [listRv, setListRv] = useState([]);
  const [selectedDateList, setSelectedDateList] = useState([]);
  useEffect(() => {
    setListRv(
      data.filter(
        (item) =>
          item?.service_medical === serviceType && item?.id_medecin === author
      )
    );
  }, [data]);

  return (
    <Card loading={isLoading} >
      <Flex justify="space-between" align="center">
        <Title level={3}>Mon agenda</Title>
        <ReloadButton onRefresh={onRefresh} />
      </Flex>
      <Tabs
        defaultActiveKey="1"
        items={[
          {
            key: "1",
            label: "Mes rendez-vous",
            children: (
              <div>
                <Calendar
                  cellRender={(current, info) => {
                    const filteredList = listRv.filter((item) => {
                      let rvDate = new Date(item.date_rv).getDate();
                      let rvMonth = new Date(item.date_rv).getMonth();
                      let rvYear = new Date(item.date_rv).getFullYear();
                      let fullRvDate = rvDate + "-" + rvMonth + "-" + rvYear;
                      let currentDate = current.date();
                      let currentMonth = current.month();
                      let currentYear = current.year();
                      let fullCurrentDate =
                        currentDate + "-" + currentMonth + "-" + currentYear;

                      if (fullRvDate === fullCurrentDate) {
                        return item;
                      }

                      return null;
                    });
                    return (
                      <div
                        onClick={() => {
                          setSelectedDateList(filteredList);
                          setOpen(true);
                        }}
                      >
                        <Avatar.Group>
                          {filteredList.map((item) => (
                            <Tooltip
                              key={item.num_ordre}
                              title={`${item.prenom_patient} ${item.nom_patient}`}
                              placement="top"
                            >
                              <Avatar style={{ backgroundColor: "#87d068" }}>
                                {`${item.prenom_patient[0].toUpperCase()}${item.nom_patient[0].toUpperCase()}`}
                              </Avatar>
                            </Tooltip>
                          ))}
                        </Avatar.Group>
                      </div>
                    );
                  }}
                  onSelect={(date, info) => {}}
                  fullscreen
                />

                <Modal
                  title={"Liste des RV"}
                  width={1000}
                  open={open}
                  onCancel={() => {
                    setOpen(false);
                  }}
                  footer={null}
                  destroyOnClose
                >
                  <DayAppointment
                    serviceType={serviceType}
                    data={selectedDateList}
                  />
                </Modal>
              </div>
            ),
          },
          {
            key: "2",
            label: "Indisponibilités",
            children: "Indisponibilités",
          },
        ]}
      />
    </Card>
  );
}

export default AgendaComponent;
