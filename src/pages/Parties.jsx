import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "../firebase-config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../redux/slices/modal";
import DeleteModal from "../components/DeleteModal";

const PartiesPage = ({ title }) => {
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
      title: "Founded",
      dataIndex: "founded",
      key: "founded",
    },
    {
      title: "Color",
      dataIndex: "color",
      key: "color",
      render: (_, data) => (
        <div
          style={{
            height: "30px",
            width: "100px",
            backgroundColor: `${data.color}`,
            borderRadius: 5,
          }}
        ></div>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              toggleAddNewPartyForm(record, "Update Party Information");
            }}
          >
            Edit
          </a>
          <a
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
    getPartyInfo();
  }, [modalState]);

  const getPartyInfo = () => {
    getDocs(collection(db, "party"))
      .then((snapshot) => {
        const tempArray = [];
        snapshot.forEach((item) => {
          const data = item.data();
          tempArray.push({ ...data, id: item.id });
        });
        setTableData(tempArray);
      })
      .catch((err) => console.log("An error occurred fetching party"));
  };

  const toggleAddNewPartyForm = (
    initialData = null,
    header = "Register Party"
  ) => {
    dispatch(
      showModal({
        header: header,
        type: "registerParty",
        data: initialData,
      })
    );
  };

  const handleDeleteAction = async () => {
    try {
      await deleteDoc(doc(db, "party", recordToDelete?.id));
      getPartyInfo();
      setShowDeleteModal(false);
    } catch (err) {
      console.log("An error occurred deleting record");
    }
  };

  console.log("table", tableData);
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
        <h1 style={{ fontSize: "40px" }}>{title}</h1>
        <Button
          type="primary"
          shape="round"
          icon={<PlusOutlined />}
          size="large"
          style={{ fontWeight: 500 }}
          onClick={() => {
            toggleAddNewPartyForm();
          }}
        >
          Add New Party
        </Button>
      </div>

      <Table columns={columns} dataSource={tableData} />
    </div>
  );
};

export default PartiesPage;
