import React, { useState, useEffect } from "react";
import { getDocs, collection, updateDoc, doc } from "@firebase/firestore";
import DummyImage from "../images/dummy_image.jpg";
import { db } from "../firebase-config";
import { Button, Modal } from "antd";
import { CheckCircleFilled, PoweroffOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage";
import Loader from "../components/Loader";
import { getUsersInfo } from "../redux/slices/elections";

const VotingPortal = () => {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage("user");
  const [votes, setVotes] = useState([]);
  const [electionsData, setElectionsData] = useState({});
  const [partyInfo, setPartyInfo] = useState([]);
  const [showVotingSuccessModal, setShowVotingSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getRunningElection();
    getPartyInfo();

    if (!user) navigate("/", { replace: true });
  }, []);

  const getRunningElection = () => {
    getDocs(collection(db, "candidates"))
      .then((snapshot) => {
        let candidates = {};
        snapshot.forEach((item) => {
          candidates[item.id] = { ...item.data(), id: item.id };
        });

        //Get elections
        getDocs(collection(db, "elections"))
          .then((snapshot) => {
            snapshot.forEach((item) => {
              let data = item.data();
              if (data.status === "Running") {
                let candidateIds = Object.keys(data?.candidates);
                const votesCast = Object.values(data?.candidates);
                votesCast.map((vote) => setVotes([...votes, ...vote]));
                const candidatesInfo = candidateIds?.map(
                  (c_id) => candidates[c_id.trim()]
                );
                data = { ...data, candidatesInfo, id: item.id };
                setElectionsData(data);
              }
            });
          })
          .catch((err) => console.log("An error occurred fetching elections"));
      })
      .catch((err) => console.log("An error occurred fetching elections"));
  };

  const getPartyInfo = () => {
    getDocs(collection(db, "party"))
      .then((snapshot) => {
        const tempArray = [];
        snapshot.forEach((item) => {
          const data = item.data();
          tempArray.push({ ...data, id: item.id });
        });
        setPartyInfo(tempArray);
      })
      .catch((err) => console.log("An error occurred fetching party"));
  };

  const handleCastVote = async (candidateId, electionData, voterId) => {
    setLoading(true);
    try {
      const { id, candidatesInfo, ...electionInfo } = electionData;

      const _docRef = await updateDoc(doc(db, "elections", id), {
        ...electionInfo,
        candidates: {
          ...electionData.candidates,
          [candidateId]: [...electionData.candidates[candidateId], voterId],
        },
      });

      setShowVotingSuccessModal(true);
      setLoading(false);
    } catch (e) {
      console.error("Error adding document: ", e);
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowVotingSuccessModal(false);
    getPartyInfo();
    getRunningElection();
    setTimeout(() => {
      setUser(undefined);
      navigate("/", { replace: true });
    }, 3000);
  };

  return (
    <>
      <VotingSuccessModal
        show={showVotingSuccessModal}
        closeModal={handleCloseModal}
      />
      <div style={{ paddingBottom: 80, paddingLeft: 25, paddingRight: 25 }}>
        <div
          style={{
            height: 60,
            borderBottom: "solid 1px #737373",
            display: "flex",
            flexDirection: "row",
            paddingLeft: 30,
            paddingRight: 30,
            paddingTop: 15,
            paddingBottom: 10,
            justifyContent: "flex-end",
            gap: 30,
          }}
        >
          <div>
            <p
              style={{ margin: 0, padding: 0, fontSize: 14, color: "#737373" }}
            >
              Hello
            </p>
            <p
              style={{
                margin: 0,
                padding: 0,
                fontSize: 18,
                color: "#737373",
                fontWeight: 700,
                marginTop: 3,
              }}
            >
              {user?.name}
            </p>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              cursor: "pointer",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => {
              navigate("/", { replace: true });
            }}
          >
            <PoweroffOutlined style={{ fontSize: 22, color: "#737373" }} />
            <span style={{ color: "#737373", marginLeft: "5px" }}>Logout</span>
          </div>
        </div>

        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            textAlign: "center",
            marginTop: 50,
          }}
        >
          {electionsData.name}
        </p>
        <p
          style={{
            fontSize: 30,
            fontWeight: 700,
            textAlign: "center",
            marginTop: 20,
          }}
        >
          {`Position: ${electionsData.position} - ${electionsData.year}`}
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            gap: 90,
          }}
        >
          {electionsData?.candidatesInfo?.map((item, idx) => {
            const candidateParty = partyInfo.find(
              (party) => party.id === item.party
            );

            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
                key={item.id}
              >
                <div
                  style={{ fontWeight: 700, fontSize: 60, color: "#727272" }}
                >
                  {electionsData?.candidates[item?.id?.trim()]?.length}
                </div>
                <img
                  src={item.image}
                  style={{
                    height: 280,
                    width: 280,
                    objectFit: "cover",
                    border: `solid 2px ${candidateParty?.color}`,
                    borderRadius: 10,
                  }}
                />
                <p
                  style={{
                    color: "#727272",
                    fontSize: 16,
                    padding: 0,
                    margin: 0,
                    marginTop: 30,
                  }}
                >
                  {item?.name}
                </p>
                <p
                  style={{
                    color: "#727272",
                    fontSize: 32,
                    padding: 0,
                    margin: 0,
                    marginTop: 15,
                  }}
                >
                  {candidateParty.name}
                </p>

                <Button
                  style={{
                    backgroundColor: `${candidateParty?.color}`,
                    borderRadius: 10,
                    color: "white",
                    fontWeight: 700,
                    width: 140,
                    height: 60,
                    border: `1px solid ${candidateParty?.color}`,
                    marginTop: 35,
                  }}
                  onClick={() => {
                    handleCastVote(item?.id?.trim(), electionsData, user?.id);
                  }}
                  disabled={loading}
                >
                  {loading ? <Loader size={24} color="white" /> : "VOTE"}
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

const VotingSuccessModal = ({ show, closeModal }) => {
  return (
    <Modal open={show} onOk={closeModal} onCancel={closeModal} footer={[]}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <CheckCircleFilled
          style={{
            fontSize: 70,
            textAlign: "center",
            marginTop: 15,
            color: "green",
          }}
        />

        <p style={{ textAlign: "center", color: "#727272", fontSize: 30 }}>
          Thank you for your vote
        </p>

        <p
          style={{
            textAlign: "center",
            color: "#727272",
            fontSize: 20,
            fontStyle: "italic",
            fontWeight: 300,
          }}
        >
          Please note that after voting you will be logged out of the system and
          will not be allowed to log back in until the next election. This is a
          safety measure to prevent double voting. You can follow the election
          results from the login page.{" "}
        </p>

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

export default VotingPortal;
