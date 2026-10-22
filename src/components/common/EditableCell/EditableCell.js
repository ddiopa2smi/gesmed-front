import { Form, Input, InputNumber, Modal } from "antd";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./EditableCell.scss";
import TextArea from "antd/es/input/TextArea";

function EditableCell({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) {
  // const inputNode = inputType === "number" ? <InputNumber /> : <Input />;
  const inputNode = inputType === "number" ? <InputNumber min={0} /> : <TextArea />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Veuillez entrer le champ ${title}!`,
            },
            ...(dataIndex === "qte_servie" ? [
              {
                validator: (_, value) => {
                  if (value !== undefined && value !== null && record && record.qte !== undefined) {
                    if (Number(value) > Number(record.qte)) {
                      Modal.error({
                        title: 'Erreur',
                        content: `Veuillez reprendre la saisie, la valeur saisie est supérieure à la valeur de la quantité prescripte (${record.qte})`,
                      })
                      return Promise.reject(
                        new Error(`Quantité > ${record.qte}`)
                      );
                    }
                  }
                  return Promise.resolve();
                },
              },
            ] : []),
          ]}
          initialValue={record[dataIndex]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
}

export default EditableCell;
