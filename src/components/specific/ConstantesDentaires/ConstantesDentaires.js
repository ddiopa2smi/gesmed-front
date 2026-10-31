import React, { useEffect, useState } from "react";
import { Button, Col, Flex, Form, Input, InputNumber, Modal, Row, Skeleton, Typography, message } from "antd";
import { getActions, postActions } from "../../../actions/actions";
import { endpoints } from "../../../constants/endpoints.constants";

const { Text } = Typography;

const SEUIL_FIEVRE = 37.5;

// Constantes prises par l'assistante avant le soin : le pré-examen dentaire se limite à l'essentiel
function ConstantesDentaires({ record, onFermer, onEnregistre }) {
  const [form] = Form.useForm();
  const [consultation, setConsultation] = useState(null);
  const [enCours, setEnCours] = useState(false);
  const temp = Form.useWatch("temp", form);

  useEffect(() => {
    getActions(`${endpoints.consultations.FIND_CONSULTATIONS}?numRV=${record.num_ordre}`).then((response) => {
      const data = response?.data || {};
      setConsultation(data);
      form.setFieldsValue({ tension: data.tension, pouls: data.pouls, temp: data.temp || null });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record.num_ordre]);

  const enregistrer = (values) => {
    setEnCours(true);
    // Sans consultation pour ce rendez-vous, l'API la crée et marque le rendez-vous comme pré-examiné
    postActions(endpoints.consultations.SAVE, { ...consultation, ...values, numpat: record.num_patient, numrv: record.num_ordre })
      .then((response) => {
        if (response?.data?.Saved === true) {
          message.success("Constantes enregistrées");
          onEnregistre();
        } else {
          message.error("Les constantes n'ont pas pu être enregistrées");
        }
      })
      .finally(() => setEnCours(false));
  };

  return (
    <Modal
      open width={520} title="Constantes avant le soin" onCancel={onFermer}
      footer={(
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onFermer}>Annuler</Button>
          <Button type="primary" loading={enCours} disabled={!consultation} onClick={() => form.submit()}>Enregistrer</Button>
        </Flex>
      )}
    >
      <Text strong>{record.prenom_patient} {record.nom_patient}</Text>
      <div><Text type="secondary">N° {record.num_patient}</Text></div>
      {!consultation && <Skeleton active paragraph={{ rows: 2 }} />}
      <Form form={form} layout="vertical" onFinish={enregistrer} hidden={!consultation} style={{ marginTop: 16 }}>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item label="Tension" name="tension" rules={[{ pattern: /^\d{1,3}\/\d{1,3}$/, message: "Format : 120/80" }]}>
              <Input placeholder="120/80" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="Pouls" name="pouls">
              <Input placeholder="bpm" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label="Température" name="temp"
              validateStatus={temp > SEUIL_FIEVRE ? "warning" : undefined}
              help={temp > SEUIL_FIEVRE ? "Fièvre : à signaler au dentiste" : undefined}
            >
              <InputNumber min={30} max={45} step={0.1} addonAfter="°C" style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}

export default ConstantesDentaires;
