import React, { useEffect, useState } from "react";
import VoteImage from "../images/vote-image.svg";
import { getDoc, doc, updateDoc } from "@firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Input, message } from "antd";
import styled from "styled-components";
import Loader from "../components/Loader";

const PasswordReset = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const userRef = await getDoc(doc(db, "users", userId));
    try {
      const docRef = await updateDoc(doc(db, "users", userId), {
        ...userRef.data(),
        password,
      });

      setLoading(false);
      message.success("Password reset successful");
      navigate("/", { replace: true });
    } catch (e) {
      setLoading(false);
      console.error("Error adding document: ", e);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "white",
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
          fontSize: 20,
          fontWeight: 600,
        }}
      >
        Welcome to E-Voting (Password Reset)
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
        <Input.Password
          style={{ height: 50, borderRadius: 20 }}
          placeholder="Password"
          name="password"
          visibilityToggle={true}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          value={password}
        />
        <div style={{ height: 20 }}></div>

        <FormButton
          style={{
            height: 50,
            borderRadius: 70,
            width: "60%",
            backgroundColor: "black",
            color: "white",
            fontWeight: 700,
            alignSelf: "center",
          }}
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? <Loader size={24} color="white" /> : "Login"}
        </FormButton>
      </div>
    </div>
  );
};

const FormButton = styled(Button)`
  &:hover {
    background-color: white !important;
    color: black !important;
    border-color: black !important;
  }
`;

export default PasswordReset;
