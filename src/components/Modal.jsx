import { Button, Modal } from "antd";
import { useState } from "react";
import RegisterUser from "./forms/RegisterUser";
import { useSelector, useDispatch } from "react-redux";
import { hideModal } from "../redux/slices/modal";
import RegisterParty from "./forms/RegisterParty";
import RegisterCandidate from "./forms/RegisterCandidate";
import CreateElection from "./forms/CreateAnElection";

const CustomModal = ({ children }) => {
  const modalState = useSelector((state) => state.modal);
  const dispatch = useDispatch();

  const closeModal = () => {
    dispatch(hideModal());
  };

  return (
    <Modal
      title={modalState.header}
      open={modalState.show}
      onOk={closeModal}
      onCancel={closeModal}
      footer={[]}
    >
      {modalState.type === "registerUser" && <RegisterUser />}
      {modalState.type === "registerCandidate" && <RegisterCandidate />}
      {modalState.type === "createElection" && <CreateElection />}
      {modalState.type === "registerParty" && <RegisterParty />}
    </Modal>
  );
};
export default CustomModal;
