import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Button, Alert } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "../firebase-config";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../redux/slices/modal";
import DeleteModal from "../components/DeleteModal";

const UsersPage = ({ title }) => {
  const dispatch = useDispatch();
  const modalState = useSelector((state) => state.modal);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [tableData, setTableData] = useState([]);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Age",
      dataIndex: "age",
      key: "age",
    },
    {
      title: "Address",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Contact",
      dataIndex: "contact",
      key: "contact",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (_, data) => data.type.toUpperCase(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            style={{ color: "#3c28dc" }}
            onClick={() => {
              toggleAddUserForm(record, "Update User Information");
            }}
          >
            Edit
          </a>
          <a
            style={{ color: "#3c28dc" }}
            onClick={() => {
              setRecordToDelete({ name: record.name, id: record.id });
              setShowDeleteModal(true);
            }}
          >
            Delete
          </a>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    getUserInfo();
  }, [modalState]);

  const getUserInfo = () => {
    getDocs(collection(db, "users"))
      .then((snapshot) => {
        const tempArray = [];
        snapshot.forEach((item) => {
          const data = item.data();
          tempArray.push({ ...data, id: item.id });
        });
        setTableData(tempArray);
      })
      .catch((err) => console.log("An error occurred fetching users"));
  };

  const toggleAddUserForm = (
    initialData = null,
    header = "Register Student"
  ) => {
    dispatch(
      showModal({
        header: header,
        type: "registerUser",
        data: initialData,
      })
    );
  };

  const handleDeleteAction = async () => {
    try {
      await deleteDoc(doc(db, "users", recordToDelete?.id));
      getUserInfo();
      setShowDeleteModal(false);
    } catch (err) {
      console.log("An error occurred deleting record");
    }
  };

  return (
    <div>
      {showDeleteModal && (
        <DeleteModal
          show={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
          }}
          name={recordToDelete?.name}
          confirm={handleDeleteAction}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ fontSize: "40px", color: "#393939" }}>{title}</h1>
        <Button
          type="primary"
          shape="round"
          icon={<PlusOutlined />}
          size="large"
          style={{ fontWeight: 500, backgroundColor: "#3c28dc" }}
          onClick={() => {
            toggleAddUserForm();
          }}
        >
          Add New Student
        </Button>
      </div>

      <Table columns={columns} dataSource={tableData} />
    </div>
  );
};

export default UsersPage;
