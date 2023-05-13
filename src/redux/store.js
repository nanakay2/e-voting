import { configureStore } from "@reduxjs/toolkit";
import modalReducer from "./slices/modal";
import electionsSlice from "./slices/elections";

const store = configureStore({
  reducer: {
    modal: modalReducer,
    elections: electionsSlice,
  },
});

export default store;
