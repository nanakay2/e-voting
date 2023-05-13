import React from "react";
import "./index.css";
import AdminLayout from "./components/AdminLayout";
import UsersPage from "./pages/Users";
import Modal from "./components/Modal";
import AdminLogin from "./pages/AdminLogin";

const App = () => {
  return (
    <>
      {/* <Modal></Modal>
      <AdminLayout /> */}
      <AdminLogin />
    </>
  );
};
export default App;
