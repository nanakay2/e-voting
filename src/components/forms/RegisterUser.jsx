import React, { useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Form,
  Input,
  DatePicker,
  Select,
  message,
} from "antd";
import Loader from "../Loader";
import { useDispatch, useSelector } from "react-redux";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDocs,
  or,
} from "firebase/firestore";
import { db } from "../../firebase-config";
import { hideModal } from "../../redux/slices/modal";
import dayjs from "dayjs";
import emailjs from "@emailjs/browser";
import {
  generateVotersNumber,
  disableSubmitButton,
  validatePassword,
} from "../../helpers/utils";
import styled from "styled-components";

const { Option } = Select;

const RegisterUser = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const initialData = useSelector((state) => state.modal?.data);
  const [formValues, setFormValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const dateFormat = "YYYY-MM-DD";

  useEffect(() => {
    if (initialData !== null) {
      setFormValues({
        ...initialData,
        date_of_birth: dayjs(initialData?.date_of_birth, dateFormat),
      });
    } else {
      setFormValues({});
    }

    setLoading(false);

    return () => {
      form.resetFields();
    };
  }, [initialData]);

  const handleInputChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const sendEmail = (receiver) => {
    emailjs
      .send(
        process.env.REACT_APP_EMAIL_SERVICE_ID,
        process.env.REACT_APP_EMAIL_TEMPATE_ID,
        {
          to_name: receiver.name,
          message: `https://quiet-faun-201465.netlify.app/reset-password/${receiver.id}`,
          to_email: receiver.email,
        },
        process.env.REACT_APP_EMAIL_SERVICE_PUBLIC_KEY
      )
      .then(
        (result) => {
          message.success("Email sent to user");
        },
        (error) => {
          message.error("Error occurred sending email to");
        }
      );
  };

  const emailOrStudentExists = async () => {
    try {
      const usrRef = collection(db, "users");
      const userQuery = query(
        usrRef,
        or(
          where("email", "==", formValues.email),
          where("s_number", "==", formValues.s_number)
        )
      );
      const userSnapShot = await getDocs(userQuery);
      let existAlready = false;
      userSnapShot.forEach(async (doc) => {
        if (doc.data()) {
          message.error("Email or student number already exists");
          setLoading(false);
          existAlready = true;
        }
      });
      return existAlready;
    } catch (err) {
      setLoading(false);
      console.log("Error Occurred");
    }
  };

  const handleFormSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const emailEx = await emailOrStudentExists();
    if (!initialData) {
      if (!emailEx) {
        try {
          const docRef = await addDoc(collection(db, "users"), {
            ...formValues,
            date_of_birth: dayjs(formValues.date_of_birth).format("YYYY-MM-DD"),
          });
          if (docRef) {
            setLoading(false);
            sendEmail({
              id: docRef.id,
              name: formValues.name,
              email: formValues.email,
            });
          }
          dispatch(hideModal());
          setFormValues({});
          console.log("Document written with ID: ", docRef.id);
        } catch (e) {
          setLoading(false);
          console.error("Error adding document: ", e);
        }
      }
    } else {
      try {
        const { id, ...userInfo } = formValues;
        const docRef = await updateDoc(doc(db, "users", initialData?.id), {
          ...userInfo,
          date_of_birth: dayjs(userInfo.date_of_birth).format("YYYY-MM-DD"),
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

  useEffect(() => {
    if (formValues?.password !== undefined) {
      if (!validatePassword(formValues?.password)) {
        console.log(formValues?.password);
        setPasswordError("Password Invalid");
      } else {
        setPasswordError("");
      }
    }
  }, [formValues?.password]);

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
            format={dateFormat}
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
          label="Student Id"
          name="s_number"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input student id!",
            },
          ]}
          valuePropName={formValues?.s_number}
          onChange={handleInputChange}
        >
          <Input name="s_number" value={formValues?.v_number} />
        </Form.Item>

        <Form.Item
          label="User Type"
          name="type"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input user type!",
            },
          ]}
          valuePropName={formValues?.type}
        >
          <Select
            placeholder="User Type"
            onChange={(val) => {
              setFormValues({ ...formValues, type: val });
            }}
            defaultValue={formValues?.type}
            value={formValues?.type}
          >
            <Option value="voter">Voter</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Form.Item
          label="Password"
          name="password"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input password!",
            },
          ]}
          tooltip={
            <div>
              <p style={{ padding: 0, margin: 0 }}>Password should:</p>
              <p style={{ padding: 0, margin: 0, marginLeft: 10 }}>
                - Contain at least 1 Upper case letter
              </p>
              <p style={{ padding: 0, margin: 0, marginLeft: 10 }}>
                - Contain at least 1 Lower case letter
              </p>
              <p style={{ padding: 0, margin: 0, marginLeft: 10 }}>
                - Contain at least 1 Number{" "}
              </p>
              <p style={{ padding: 0, margin: 0, marginLeft: 10 }}>
                - Be greater than 6 characters
              </p>
            </div>
          }
          valuePropName={formValues?.password}
          onChange={handleInputChange}
        >
          <Input.Password name="password" value={formValues?.password} />
        </Form.Item>
        {!!formValues?.password && !!passwordError && (
          <p
            style={{
              fontStyle: "italic",
              color: "red",
              fontWeight: 500,
              marginTop: -20,
            }}
          >
            Password invalid. (Check tooltip)
          </p>
        )}
      </div>

      <h3 style={{ marginTop: 5 }}>Next of Kin</h3>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Name"
          name="next_of_kin.name"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input name of next of kin!",
            },
          ]}
          valuePropName={formValues?.next_of_kin?.name}
          onChange={(e) => {
            setFormValues({
              ...formValues,
              next_of_kin: {
                ...formValues.next_of_kin,
                name: e.target.value,
              },
            });
          }}
        >
          <Input
            name="next_of_kin.name"
            value={formValues?.next_of_kin?.name}
          />
        </Form.Item>

        <Form.Item
          label="Relationship"
          name="next_of_kin.relationship"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input relationship!",
            },
          ]}
          valuePropName={formValues?.next_of_kin?.relationship}
          onChange={(e) => {
            setFormValues({
              ...formValues,
              next_of_kin: {
                ...formValues.next_of_kin,
                relationship: e.target.value,
              },
            });
          }}
        >
          <Input
            name="next_of_kin.relationship"
            value={formValues?.next_of_kin?.relationship}
          />
        </Form.Item>
      </div>

      <div style={{ display: "flex", flexDirection: "row", gap: 10 }}>
        <Form.Item
          label="Contact"
          name="next_of_kin.contact"
          style={{ width: "48%" }}
          rules={[
            {
              required: true,
              message: "Please input contact!",
            },
          ]}
          valuePropName={formValues?.next_of_kin?.contact}
          onChange={(e) => {
            setFormValues({
              ...formValues,
              next_of_kin: {
                ...formValues.next_of_kin,
                contact: e.target.value,
              },
            });
          }}
        >
          <CustomNumberInput
            name="next_of_kin.contact"
            value={formValues?.next_of_kin?.contact}
            type="number"
          />
        </Form.Item>
      </div>

      <Form.Item style={{ width: "100%" }}>
        <Button
          type="primary"
          htmlType="submit"
          style={{ width: "100%", backgroundColor: "#3c28dc", color: "white" }}
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
                "s_number",
                "type",
                "password",
                "next_of_kin",
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
export default RegisterUser;
