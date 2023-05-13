import React, { useEffect, useState } from "react";
import { Button, Form, Input, DatePicker, Select, Upload, message } from "antd";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import Loader from "../Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db, storage } from "../../firebase-config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { hideModal } from "../../redux/slices/modal";
import dayjs from "dayjs";
import { disableSubmitButton } from "../../helpers/utils";
import styled from "styled-components";

const { Option } = Select;

const RegisterCandidate = () => {
  const dispatch = useDispatch();
  const initialData = useSelector((state) => state.modal?.data);
  const [formValues, setFormValues] = useState({});
  const [partyInfo, setPartyInfo] = useState({});
  const [imageUrl, setImageUrl] = useState();
  const [loading, setLoading] = useState(false);
  const dateFormat = "YYYY-MM-DD";

  useEffect(() => {
    getPartyInfo();
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialData)
      setFormValues({
        ...initialData,
        date_of_birth: dayjs(initialData?.date_of_birth, dateFormat),
      });
    else setFormValues({});
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    if (!initialData) {
      try {
        const docRef = await addDoc(collection(db, "candidates"), {
          ...formValues,
          date_of_birth: dayjs(formValues.date_of_birth).format("YYYY-MM-DD"),
        });
        if (docRef) {
          setLoading(false);
        }
        dispatch(hideModal());
        setImageUrl(null);
        setFormValues({});
        console.log("Document written with ID: ", docRef.id);
      } catch (e) {
        setLoading(false);
        dispatch(hideModal());
        setImageUrl(null);
        setFormValues({});
        console.error("Error adding document: ", e);
      }
    } else {
      const { id, ...candidateInfo } = formValues;

      try {
        const docRef = await updateDoc(doc(db, "candidates", initialData?.id), {
          ...candidateInfo,
          date_of_birth: dayjs(candidateInfo.date_of_birth).format(
            "YYYY-MM-DD"
          ),
        });
        if (docRef) {
          setLoading(false);
        }
        dispatch(hideModal());
        setFormValues({});
        setImageUrl(null);
      } catch (e) {
        setLoading(false);
        dispatch(hideModal());
        setImageUrl(null);
        setFormValues({});
        console.error("Error adding document: ", e);
      }
    }
  };

  const getPartyInfo = () => {
    getDocs(collection(db, "party"))
      .then((snapshot) => {
        snapshot.forEach((item) => {
          setPartyInfo((prev) => ({ ...prev, [item.id]: item.data() }));
        });
      })
      .catch((err) => console.log("An error occurred fetching parties"));
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    return isJpgOrPng;
  };

  const uploadButton = (
    <div>
      {loading ? <LoadingOutlined /> : <PlusOutlined />}
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </div>
  );

  const handleChange = (info) => {
    setImageUrl(URL.createObjectURL(info.file.originFileObj));
    setLoading(true);
    const stRef = ref(storage, info.file.originFileObj.name);
    uploadBytes(stRef, info.file.originFileObj).then((snap) => {
      getDownloadURL(snap.ref).then((downloadURL) => {
        setFormValues({ ...formValues, image: downloadURL });
        setLoading(false);
      });
    });
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
          valuePropName={formValues?.name}
          onChange={handleInputChange}
        >
          <Input name="name" value={formValues?.name} />
        </Form.Item>

        <Form.Item
          label="Age"
          name="age"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input age!",
            },
          ]}
          valuePropName={formValues?.age}
          onChange={handleInputChange}
        >
          <Input name="age" value={formValues?.age} type="number" />
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <div style={{ width: "48%" }}>
          <p style={{ margin: 0, padding: 0, marginBottom: 7 }}>
            <span style={{ color: "#ff4d4f", marginRight: 5 }}>*</span>Date of
            Birth
          </p>
          <DatePicker
            onChange={(d, ds) => {
              setFormValues({
                ...formValues,
                date_of_birth: dayjs(ds, dateFormat),
              });
            }}
            defaultValue={formValues?.date_of_birth}
            value={formValues?.date_of_birth}
            style={{ width: "100%", height: "40%" }}
          />
        </div>

        <Form.Item
          label="Address"
          name="address"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input address!",
            },
          ]}
          valuePropName={formValues?.address}
          onChange={handleInputChange}
        >
          <Input name="address" value={formValues.address} />
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Marital Status"
          name="marital_status"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please choose marital status!",
            },
          ]}
          valuePropName={formValues?.marital_status}
        >
          <Select
            placeholder="Marital Status"
            onChange={(val) => {
              setFormValues({ ...formValues, marital_status: val });
            }}
            defaultValue={formValues?.marital_status}
            value={formValues?.marital_status}
          >
            <Option value="single">Single</Option>
            <Option value="married">Married</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Gender"
          name="gender"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input gender!",
            },
          ]}
          valuePropName={formValues?.gender}
        >
          <Select
            placeholder="Gender"
            onChange={(val) => {
              setFormValues({ ...formValues, gender: val });
            }}
            defaultValue={formValues?.gender}
            value={formValues?.gender}
          >
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
          </Select>
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Contact"
          name="contact"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input contact!",
            },
          ]}
          valuePropName={formValues?.contact}
          onChange={handleInputChange}
        >
          <CustomNumberInput
            name="contact"
            value={formValues?.contact}
            type="number"
          />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input email!",
            },
          ]}
          valuePropName={formValues?.email}
          onChange={handleInputChange}
        >
          <Input name="email" value={formValues?.email} type="email" />
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Political Party"
          name="party"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please choose a political party!",
            },
          ]}
          valuePropName={formValues?.party}
        >
          <Select
            placeholder="Political Party"
            onChange={(val) => {
              setFormValues({ ...formValues, party: val });
            }}
            defaultValue={formValues?.party}
            value={formValues?.party}
          >
            {Object.keys(partyInfo).map((item) => {
              return (
                <Option value={item} key={item}>
                  {partyInfo[item].name}
                </Option>
              );
            })}
          </Select>
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item label="Image" name="image" style={{ width: "48%" }} required>
          <Upload
            name="avatar"
            listType="picture-circle"
            className="avatar-uploader"
            showUploadList={false}
            // action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
            beforeUpload={beforeUpload}
            onChange={handleChange}
          >
            {imageUrl || formValues?.image ? (
              <img
                src={imageUrl || formValues?.image}
                alt="avatar"
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: 55,
                  objectFit: "cover",
                }}
              />
            ) : (
              uploadButton
            )}
          </Upload>
        </Form.Item>
      </div>

      <Form.Item style={{ width: "100%" }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%" }}
          onClick={handleFormSubmit}
          disabled={
            disableSubmitButton(
              [
                "name",
                "age",
                "date_of_birth",
                "address",
                "marital_status",
                "gender",
                "contact",
                "email",
                "party",
                "image",
              ],
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

const CustomNumberInput = styled(Input)`
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

export default RegisterCandidate;
