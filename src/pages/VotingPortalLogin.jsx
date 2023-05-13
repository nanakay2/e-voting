import React, { useState } from "react";
import VotingImage from "../images/vote-image.svg";
import { Input, Button, Modal } from "antd";
import { InfoCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { getDocs, collection, query, where } from "@firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import Loader from "../components/Loader";

const VotingPortalLogin = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState({});
  const [errorStatus, setErrorStatus] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showVotedAlreadyModal, setShowVotedAlreadyModal] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [_, setLoggedInUser] = useLocalStorage("user");
  const [loading, setLoading] = useState(false);

  const usersRef = collection(db, "users");
  const electionsRef = collection(db, "elections");

  const getUserInfo = async () => {
    const usrQuery = query(usersRef, where("email", "==", formValues.email));
    const userQuerySnapshot = await getDocs(usrQuery);
    let userDetails = null;
    userQuerySnapshot.forEach((doc) => {
      userDetails = { ...doc.data(), id: doc.id };
    });
    return userDetails;
  };

  const getRunningElections = async () => {
    const runningElectionsQuery = query(
      electionsRef,
      where("status", "==", "Running")
    );
    const electionsQuerySnapshot = await getDocs(runningElectionsQuery);
    let electionsInfo = [];
    electionsQuerySnapshot.forEach((doc) => {
      electionsInfo.push({ ...doc.data(), id: doc.id });
    });
    return electionsInfo;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userDetails = await getUserInfo();
      const electionsDetails = await getRunningElections();

      if (userDetails) {
        if (
          formValues?.email &&
          formValues?.password &&
          userDetails?.email.trim() === formValues?.email.trim() &&
          userDetails?.password.trim() === formValues?.password.trim()
        ) {
          const userAlreadyVoted = Object.values(
            electionsDetails[0]?.candidates
          ).find((item) => item.includes(userDetails?.id));

          if (userAlreadyVoted) {
            setLoading(false);
            setShowVotedAlreadyModal(true);
            setModalMsg(
              "You have already cast your vote for the running election as such you can no longer access the portal."
            );
          } else if (electionsDetails.length === 0) {
            setShowVotedAlreadyModal(true);
            setModalMsg("There are no running elections at the moment.");
            setLoading(false);
          } else {
            setLoggedInUser(userDetails);
            navigate("/voting-portal", { replace: true });
            setErrorStatus(null);
            setLoading(false);
          }
        } else {
          setErrorStatus("error");
          setLoading(false);
        }
      } else {
        setErrorStatus("error");
        setLoading(false);
      }
    } catch (err) {
      console.log("An error occurred", err);
      setLoading(false);
    }
  };

  return (
    <>
      <InfoModal
        show={showInfoModal}
        closeModal={() => {
          setShowInfoModal(false);
        }}
      />
      <ElectionModal
        show={showVotedAlreadyModal}
        closeModal={() => {
          setShowVotedAlreadyModal(false);
        }}
        message={modalMsg}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          backgroundColor: "white",
          // width: "100%",
          height: "100%",
          padding: 40,
        }}
      >
        <div
          style={{
            width: "40%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            //   alignItems: "center",
            paddingLeft: 30,
            paddingRight: 30,
            position: "relative",
          }}
        >
          <p style={{ marginBottom: 50, fontSize: 25, fontWeight: 700 }}>
            Welcome to E-Voting System
          </p>
          <label style={{ marginBottom: 10, fontWeight: 700 }}>Email</label>
          <Input
            style={{ height: 60, borderRadius: 15 }}
            name="email"
            placeholder="Email"
            status={errorStatus}
            onChange={(e) => {
              setFormValues({ ...formValues, [e.target.name]: e.target.value });
            }}
            value={formValues?.email}
          />
          <div style={{ height: 30 }}></div>

          <label style={{ marginBottom: 10, fontWeight: 700 }}>Password</label>
          <Input.Password
            style={{ height: 60, borderRadius: 15 }}
            placeholder="Password"
            name="password"
            status={errorStatus}
            onChange={(e) => {
              setFormValues({ ...formValues, [e.target.name]: e.target.value });
            }}
            value={formValues?.password}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              position: "absolute",
              bottom: 0,
              right: 30,
              alignItems: "center",
              width: "100%",
            }}
          >
            <InfoCircleOutlined
              style={{
                fontSize: 30,
                marginRight: "auto",
                marginLeft: 30,
                cursor: "pointer",
              }}
              onClick={() => {
                setShowInfoModal(true);
              }}
            />
            {/* <p
              style={{ fontWeight: 700, cursor: "pointer" }}
              onClick={() => {
                navigate("/election-history");
              }}
            >
              View History
            </p> */}
            <div style={{ width: 30 }}></div>
            <p
              style={{ fontWeight: 700, cursor: "pointer" }}
              onClick={() => {
                navigate("/election-results");
              }}
            >
              View Results
            </p>
          </div>
          <div style={{ height: 50 }}></div>

          {errorStatus && (
            <p style={{ fontStyle: "italic", color: "red" }}>
              Invalid credentials
            </p>
          )}
          <Button
            style={{
              backgroundColor: "black",
              color: "white",
              borderColor: "black",
              height: 60,
              fontWeight: 700,
              borderRadius: 15,
            }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? <Loader size={24} color="white" /> : "Login"}
          </Button>
        </div>
        <div
          style={{
            width: "60%",
            height: "100%",
            backgroundColor: "#f8f8fa",
            borderRadius: 15,
            padding: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={VotingImage} height="80%" />
        </div>
      </div>
    </>
  );
};

const InfoModal = ({ show, closeModal }) => {
  return (
    <Modal open={show} onOk={closeModal} onCancel={closeModal} footer={[]}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <InfoCircleOutlined
          style={{ fontSize: 50, textAlign: "center", marginTop: 15 }}
        />
        <p style={{ textAlign: "center" }}>
          The E-Voting System is a portal that allows voters to cast their vote
          in an election from the comfort of their homes or anywhere they may
          find themselves provided they have access to internet and a web
          browser.
          <br />
          <br />
          Once logged in, a user will have the chance to vote for a running
          election. When a user casts their vote they will not be allowed access
          to the system again. This is to prevent users from voting more than
          once. The system keeps track of all users who have cast their vote, as
          such if a user tries to login after already casting their vote, they
          will not be allowed access to the system.
          <br />
          <br />A user can also view election results and election history
          without having to login.
        </p>
      </div>
    </Modal>
  );
};

const ElectionModal = ({ show, closeModal, message }) => {
  return (
    <Modal open={show} onOk={closeModal} onCancel={closeModal} footer={[]}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <CloseCircleOutlined
          style={{
            fontSize: 60,
            textAlign: "center",
            marginTop: 15,
            color: "red",
          }}
        />

        <p style={{ textAlign: "center" }}>{message}</p>

        <Button
          style={{
            backgroundColor: "black",
            color: "white",
            borderColor: "black",
            height: 60,
            fontWeight: 700,
            borderRadius: 15,
            marginTop: 20,
          }}
          onClick={closeModal}
        >
          OK
        </Button>
      </div>
    </Modal>
  );
};

export default VotingPortalLogin;
