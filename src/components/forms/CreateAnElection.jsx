import React, { useEffect, useState } from "react";
import { Button, Form, Input, DatePicker, Select } from "antd";
import Loader from "../Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { hideModal } from "../../redux/slices/modal";
import dayjs from "dayjs";
import { disableSubmitButton } from "../../helpers/utils";

const { Option } = Select;

const CreateElection = () => {
  const dispatch = useDispatch();
  const initialData = useSelector((state) => state.modal?.data);
  const [formValues, setFormValues] = useState({});
  const [departmentInfo, setDepartmentInfo] = useState({});
  const [candidatesInfo, setCandidatesInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const dateFormat = "YYYY";

  useEffect(() => {
    getPartyInfo();
    getCandidateInfo();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormValues({
        ...initialData,
        year: dayjs(initialData?.year, dateFormat),
      });
    } else {
      setFormValues({ candidates: [] });
    }
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!initialData) {
      try {
        const docRef = await addDoc(collection(db, "elections"), {
          ...formValues,
          year: dayjs(formValues.year).format("YYYY"),
        });
        if (docRef) {
          setLoading(false);
        }
        dispatch(hideModal());
        setFormValues({});
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        setLoading(false);
        dispatch(hideModal());
        setFormValues({});
        console.error("Error adding document: ", e);
      }
    } else {
      try {
        const { id, candidatesInfo, ...electionInfo } = formValues;

        const _docRef = await updateDoc(doc(db, "elections", initialData?.id), {
          ...electionInfo,
          year: dayjs(electionInfo.year).format("YYYY"),
        });
        setLoading(false);
        dispatch(hideModal());
        setFormValues({});
      } catch (e) {
        setLoading(false);
        dispatch(hideModal());
        setFormValues({});
        console.error("Error adding document: ", e);
      }
    }
  };

  const getPartyInfo = () => {
    getDocs(collection(db, "department"))
      .then((snapshot) => {
        snapshot.forEach((item) => {
          setDepartmentInfo((prev) => ({ ...prev, [item.id]: item.data() }));
        });
      })
      .catch((err) => console.log("An error occurred fetching parties"));
  };

  const getCandidateInfo = () => {
    getDocs(collection(db, "candidates"))
      .then((snapshot) => {
        snapshot.forEach((item) => {
          setCandidatesInfo((prev) => ({ ...prev, [item.id]: item.data() }));
        });
      })
      .catch((err) => console.log("An error occurred fetching candidates"));
  };

  return (
    <Form name="basic" layout="vertical" autoComplete="off" preserve={false}>
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
          errorStatus={!formValues?.name}
          valuePropName={formValues?.name}
          onChange={handleInputChange}
        >
          <Input name="name" value={formValues?.name} />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please select status!",
            },
          ]}
          errorStatus={!formValues?.status}
          valuePropName={formValues?.status}
          onChange={handleInputChange}
        >
          <Select
            placeholder="Election Status"
            onChange={(val) => {
              setFormValues({ ...formValues, status: val });
            }}
            defaultValue={formValues?.status}
            value={formValues?.status}
          >
            <Option value="Running">Running</Option>
            <Option value="Ended">Ended</Option>
          </Select>
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Position"
          name="position"
          style={{ width: "48%", cursor: "pointer" }}
          rules={[
            {
              required: true,
              message: "Please select position!",
            },
          ]}
          errorStatus={!formValues?.position}
          valuePropName={formValues?.position}
        >
          <Select
            placeholder="Election Position"
            onChange={(val) => {
              setFormValues({ ...formValues, position: val });
            }}
            defaultValue={formValues?.position}
            value={formValues?.position}
          >
            <Option value="Department Rep.">Department Rep.</Option>
          </Select>
        </Form.Item>

        <div style={{ width: "48%" }}>
          <p style={{ margin: 0, padding: 0, marginBottom: 7 }}>
            <span style={{ color: "#ff4d4f", marginRight: 5 }}>*</span>Year
          </p>
          <DatePicker
            picker="year"
            onChange={(d, ds) => {
              setFormValues({ ...formValues, year: dayjs(ds, dateFormat) });
            }}
            defaultValue={formValues?.year}
            value={formValues?.year}
            style={{ width: "100%", height: "40%" }}
          />
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <Form.Item
          label="Candidates"
          name="candidates"
          style={{ width: "100%", cursor: "pointer" }}
          rules={[
            {
              required: true,
              message: "Please select candidates!",
            },
          ]}
          valuePropName={formValues?.candidates}
          onChange={handleInputChange}
          preserve={false}
        >
          <Select
            preserve={false}
            placeholder="Election Candidates"
            mode="multiple"
            allowClear
            onChange={(val) => {
              let candObj;
              val.forEach((item) => (candObj = { ...candObj, [item]: [] }));
              setFormValues({
                ...formValues,
                candidates: { ...candObj },
              });
            }}
            defaultValue={formValues?.candidates || []}
            value={Object.keys(formValues?.candidates || {}) || []}
          >
            {Object.keys(candidatesInfo).map((item) => {
              return (
                <Option value={item} key={item}>
                  {`${candidatesInfo[item]?.name} (${
                    departmentInfo[candidatesInfo[item].department]?.name
                  })`}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </div>

      <Form.Item style={{ width: "100%" }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%", backgroundColor: "#3c28dc" }}
          onClick={handleFormSubmit}
          disabled={
            disableSubmitButton(
              ["name", "status", "position", "year", "candidates"],
              formValues
            ) || loading
          }
        >
          {loading && <Loader size={24} color="white" />}
          {!loading && "Submit"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateElection;
