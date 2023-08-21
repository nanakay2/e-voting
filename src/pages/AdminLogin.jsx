import React, { useState } from "react";
import VoteImage from "../images/vote-image.svg";
import { getDocs, collection, query, where } from "@firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { Button, Input, message } from "antd";
import styled from "styled-components";
import useLocalStorage from "../hooks/useLocalStorage";
import Loader from "../components/Loader";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [_, setUser] = useLocalStorage("user");
  const [formValues, setFormValues] = useState({});
  const [errorStatus, setErrorStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const usersRef = collection(db, "users");

  const getUserInfo = async () => {
    const usrQuery = query(usersRef, where("email", "==", formValues.email));
    const userQuerySnapshot = await getDocs(usrQuery);
    let userDetails = null;
    userQuerySnapshot.forEach((doc) => {
      userDetails = { ...doc.data(), id: doc.id };
    });
    return userDetails;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userDetails = await getUserInfo();

      if (userDetails) {
        if (
          formValues?.email &&
          formValues?.password &&
          userDetails?.email.trim() === formValues?.email.trim() &&
          userDetails?.password.trim() === formValues?.password.trim()
        ) {
          if (userDetails.type !== "admin") {
            setLoading(false);
            setErrorStatus({
              type: {
                error: "error",
                message:
                  "You don't have permission to access the admin dashboard",
              },
            });
          } else {
            setUser(userDetails);
            navigate("/admin/dashboard", { replace: true });
            setErrorStatus(null);
            setLoading(false);
          }
        } else {
          setErrorStatus("error");
          setLoading(false);
        }
      } else {
        setLoading(false);
        setErrorStatus({
          credentials: {
            error: "error",
            message: "Invalid credentials entered",
          },
        });
      }
    } catch (err) {
      console.log("An error occurred", err);
      message.error("An error occurred while logging in");
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#ff5101",
        display: "flex",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        flexDirection: "column",
      }}
    >
      <img src={VoteImage} height={400} />
      <p
        style={{
          marginBottom: 20,
          marginTop: 15,
          fontSize: 35,
          fontWeight: 700,
          color: "white",
        }}
      >
        Welcome to Torrens University E-Voting (Admin Portal)
      </p>
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "10px",
          boxShadow: "0px 2px 2px 2px rgba(0,0,0,0.1)",
          width: "50%",
          padding: 30,
          paddingTop: 50,
          paddingBottom: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Input
          style={{ height: 50, borderRadius: 20 }}
          placeholder="Email"
          name="email"
          status={errorStatus?.credentials?.error || errorStatus?.type?.error}
          onChange={(e) => {
            setFormValues({ ...formValues, [e.target.name]: e.target.value });
          }}
          value={formValues?.email}
        />
        <div style={{ height: 40 }}></div>
        <Input.Password
          style={{ height: 50, borderRadius: 20 }}
          placeholder="Password"
          status={errorStatus?.credentials?.error || errorStatus?.type?.error}
          name="password"
          visibilityToggle={true}
          onChange={(e) => {
            setFormValues({ ...formValues, [e.target.name]: e.target.value });
          }}
          value={formValues?.password}
        />
        <div style={{ height: 20 }}></div>

        {errorStatus && (
          <p style={{ fontStyle: "italic", color: "red", textAlign: "center" }}>
            {errorStatus?.credentials?.message || errorStatus?.type?.message}
          </p>
        )}
        <FormButton
          style={{
            height: 50,
            borderRadius: 70,
            width: "60%",
            backgroundColor: "#3c28dc",
            color: "white",
            fontWeight: 700,
            alignSelf: "center",
          }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? <Loader size={24} color="#3c28dc" /> : "Login"}
        </FormButton>
      </div>
    </div>
  );
};

const FormButton = styled(Button)`
  &:hover {
    background-color: white !important;
    color: #3c28dc !important;
    border-color: #3c28dc !important;
  }
`;

export default AdminLogin;
