import { createSlice } from "@reduxjs/toolkit";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase-config";

const electionsSlice = createSlice({
  name: "elections",
  initialState: {
    users: null,
    votes: [],
    electionsData: null,
  },
  reducers: {
    getUsersInfo: (state, action) => {
      getDocs(collection(db, "users"))
        .then((snapshot) => {
          const tempArray = [];
          snapshot.forEach((item) => {
            const data = item.data();
            tempArray.push({ ...data, id: item.id });
          });
          state.users = tempArray;
        })
        .catch((err) => console.log("An error occurred fetching users"));
    },
    getRunningElections: (state, action) => {
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
                  votesCast.map((vote) => {
                    state.votes = [...state.votes, ...vote];
                  });
                  const candidatesInfo = candidateIds?.map(
                    (c_id) => candidates[c_id.trim()]
                  );
                  data = { ...data, candidatesInfo, id: item.id };
                  tempArray.push(data);
                }
              });
              state.electionsData = tempArray;
            })
            .catch((err) =>
              console.log("An error occurred fetching elections")
            );
        })
        .catch((err) => console.log("An error occurred fetching elections"));
    },
  },
});

export const { getUsersInfo, getRunningElections } = electionsSlice.actions;

export default electionsSlice.reducer;
