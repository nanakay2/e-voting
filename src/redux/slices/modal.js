import { createSlice } from "@reduxjs/toolkit";

const modalSlice = createSlice({
  name: "modal",
  initialState: {
    show: false,
    header: "",
    type: "",
    data: null,
  },
  reducers: {
    showModal: (state, action) => {
      state.show = true;
      state.header = action.payload.header;
      state.type = action.payload.type;
      if (action.payload.data) state.data = action.payload.data;
      else state.data = null;
    },
    hideModal: (state) => {
      state.show = false;
      state.header = "";
      state.type = "";
      state.data = null;
    },
  },
});

export const { showModal, hideModal } = modalSlice.actions;

export default modalSlice.reducer;
