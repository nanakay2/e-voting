import React, { useEffect, useState } from "react";
import { getDocs, collection } from "@firebase/firestore";
import { db } from "../firebase-config";
import Loader from "../components/Loader";

const ElectionResults = () => {
  const [electionsData, setElectionsData] = useState([]);
  const [votes, setVotes] = useState([]);
  const [partyInfo, setPartyInfo] = useState([]);
  const [loading, setLoading] = useState(false);

  const getRunningElection = () => {
    setLoading(true);
    getDocs(collection(db, "candidates"))
      .then((snapshot) => {
        let candidates = {};
        snapshot.forEach((item) => {
          candidates[item.id] = item.data();
        });

        //Get elections
        getDocs(collection(db, "elections"))
          .then((snapshot) => {
            const tempArray = [];
            snapshot.forEach((item) => {
              let data = item.data();
              if (data.status === "Running") {
                let candidateIds = Object.keys(data?.candidates);
                const votesCast = Object.values(data?.candidates);
                votesCast.map((vote) => setVotes([...votes, ...vote]));
                const candidatesInfo = candidateIds?.map((c_id) => ({
                  ...candidates[c_id.trim()],
                  id: c_id,
                }));
                data = { ...data, candidatesInfo, id: item.id };
                tempArray.push(data);
              }
            });
            setElectionsData(tempArray);
            setLoading(false);
          })
          .catch((err) => {
            setLoading(false);
            console.log("An error occurred fetching elections");
          });
      })
      .catch((err) => {
        setLoading(false);
        console.log("An error occurred fetching elections");
      });
  };
  const getPartyInfo = () => {
    setLoading(true);
    getDocs(collection(db, "party"))
      .then((snapshot) => {
        const tempArray = [];
        snapshot.forEach((item) => {
          const data = item.data();
          tempArray.push({ ...data, id: item.id });
        });
        setLoading(false);

        setPartyInfo(tempArray);
      })
      .catch((err) => {
        setLoading(false);
        console.log("An error occurred fetching party");
      });
  };

  useEffect(() => {
    getRunningElection();
    getPartyInfo();
  }, []);

  return (
    <>
      {loading ? (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: 250,
          }}
        >
          <Loader size={40} color="#1778ff" />
        </div>
      ) : (
        <div
          style={{
            padding: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ textAlign: "center", fontSize: 30, fontWeight: 700 }}>
            {`Election Results for ${electionsData[0]?.name}`}
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 30,
              fontWeight: 700,
              marginTop: 15,
              marginBottom: 40,
            }}
          >
            {`Position: ${electionsData[0]?.position} - (${electionsData[0]?.year})`}
          </div>

          {electionsData[0]?.candidatesInfo?.map((item) => (
            <div
              key={item}
              style={{
                height: 180,
                width: "75%",
                backgroundColor: "white",
                boxShadow: "0px 2px 2px 2px rgba(0,0,0,0.3)",
                borderRadius: 10,
                padding: "30px 50px",
                display: "flex",
                flexDirection: "row",
                marginBottom: 50,
              }}
            >
              <img
                src={item.image}
                style={{
                  height: 180,
                  width: 150,
                  borderRadius: 5,
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  marginLeft: 40,
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "space-between",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: 35, fontWeight: 700 }}>
                    {item.name}
                  </div>
                  <p style={{ fontSize: 25, fontWeight: 500 }}>
                    {partyInfo?.find((party) => party.id === item.party)?.name}
                  </p>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <p style={{ fontSize: 30, fontWeight: 700 }}>VOTES</p>
                  <p
                    style={{
                      fontSize: 30,
                      fontWeight: 700,
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {electionsData[0]?.candidates[item.id]?.length}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default ElectionResults;
