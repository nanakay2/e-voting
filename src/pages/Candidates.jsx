import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "../firebase-config";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../redux/slices/modal";
import DeleteModal from "../components/DeleteModal";

const CandidatesPage = ({ title }) => {
  const dispatch = useDispatch();
  const modalState = useSelector((state) => state.modal);
  const [partyInfo, setPartyInfo] = useState(null);
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
      title: "Party",
      dataIndex: "party",
      key: "party",
      render: (_, data) => partyInfo[data.party]?.name,
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              toggleCreateCandidateForm(record, "Update Candidate Information");
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
    getCandidateInfo();
  }, [modalState]);

  const getCandidateInfo = () => {
    getDocs(collection(db, "candidates"))
      .then((snapshot) => {
        const tempArray = [];
        snapshot.forEach(async (item) => {
          const data = { ...item.data(), id: item.id };
          tempArray.push(data);
        });
        setTableData(tempArray);
      })
      .catch((err) => console.log("An error occurred fetching candidates"));
  };

  const getPartyInfo = () => {
    getDocs(collection(db, "party"))
      .then((snapshot) => {
        snapshot.forEach((item) => {
          setPartyInfo((prev) => ({ ...prev, [item.id]: item.data() }));
        });
      })
      .catch((err) => console.log("An error occurred fetching candidates"));
  };

  const toggleCreateCandidateForm = (
    initialData = null,
    header = "Register a Candidate"
  ) => {
    dispatch(
      showModal({
        header: header,
        type: "registerCandidate",
        data: initialData,
      })
    );
  };

  const handleDeleteAction = async () => {
    try {
      await deleteDoc(doc(db, "candidates", recordToDelete?.id));
      getPartyInfo();
      getCandidateInfo();
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
        <h1 style={{ fontSize: "40px" }}>{title}</h1>
        <Button
          type="primary"
          shape="round"
          icon={<PlusOutlined />}
          size="large"
          style={{ fontWeight: 500 }}
          onClick={() => {
            toggleCreateCandidateForm();
          }}
        >
          Register a Candidate
        </Button>
      </div>

      <Table columns={columns} dataSource={tableData} />
    </div>
  );
};

export default CandidatesPage;
