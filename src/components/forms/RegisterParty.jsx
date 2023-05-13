import React, { useState, useEffect } from "react";
import { Button, Form, Input, DatePicker, Select } from "antd";
import Loader from "../Loader";
import { useDispatch, useSelector } from "react-redux";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { hideModal } from "../../redux/slices/modal";
import { ChromePicker } from "react-color";
import dayjs from "dayjs";
import { disableSubmitButton } from "../../helpers/utils";

const RegisterParty = () => {
  const dispatch = useDispatch();
  const initialData = useSelector((state) => state.modal?.data);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const dateFormat = "YYYY";

  useEffect(() => {
    if (initialData)
      setFormValues({
        ...initialData,
        founded: dayjs(initialData?.founded, dateFormat),
      });
    else setFormValues({});

    setLoading(false);
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!initialData) {
      try {
        const docRef = await addDoc(collection(db, "party"), {
          ...formValues,
          founded: dayjs(formValues.founded).format("YYYY"),
        });
        if (docRef) {
          setLoading(false);
        }
        dispatch(hideModal());
        setFormValues({});
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        setLoading(false);
        console.error("Error adding document: ", e);
      }
    } else {
      try {
        const { id, ...partyInfo } = formValues;
        const docRef = await updateDoc(doc(db, "party", initialData?.id), {
          ...partyInfo,
          founded: dayjs(partyInfo.founded).format("YYYY"),
        });
        if (docRef) setLoading(false);

        dispatch(hideModal());
        setFormValues({});
      } catch (e) {
        setLoading(false);
        console.error("Error adding document: ", e);
      }
    }
  };

  return (
    <Form name="basic" layout="vertical" autoComplete="off">
      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Name"
          name="name"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input your name!",
            },
          ]}
          onChange={handleInputChange}
          valuePropName={formValues?.name}
        >
          <Input name="name" value={formValues?.name} />
        </Form.Item>

        <div style={{ width: "48%" }}>
          <p style={{ margin: 0, padding: 0, marginBottom: 7 }}>
            <span style={{ color: "#ff4d4f", marginRight: 5 }}>*</span>Founded
          </p>
          <DatePicker
            picker="year"
            onChange={(d, ds) => {
              setFormValues({ ...formValues, founded: dayjs(ds, dateFormat) });
            }}
            defaultValue={formValues?.founded}
            value={formValues?.founded}
            style={{ width: "100%", height: "40%" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Party Color"
          name="color"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please select party color!",
            },
          ]}
        >
          <Input
            name="color"
            style={{
              cursor: "pointer",
              backgroundColor: formValues?.color,
              borderColor: formValues?.color,
            }}
          />

          <ChromePicker
            color={formValues?.color}
            onChange={(c) => {
              setFormValues({ ...formValues, color: c.hex });
            }}
          />
        </Form.Item>
      </div>
      <Form.Item style={{ width: "100%" }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          onClick={handleFormSubmit}
          disabled={
            disableSubmitButton(["name", "color", "founded"], formValues) ||
            loading
          }
        >
          {loading && <Loader size={24} color="white" />}
          {!loading && "Submit"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterParty;
