import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { db } from "../firebase-config";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { showModal } from "../redux/slices/modal";
import DeleteModal from "../components/DeleteModal";

const ElectionsPage = ({ title }) => {
  const dispatch = useDispatch();
  const modalState = useSelector((state) => state.modal);
  const [tableData, setTableData] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Candidates",
      dataIndex: "candidates",
      key: "candidates",
      render: (_, data) =>
        data?.candidatesInfo?.length > 1
          ? data?.candidatesInfo?.map((item) => item?.name).join(", ")
          : data?.candidatesInfo[0],
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a
            onClick={() => {
              toggleCreateElectionsForm(record, "Update Election Information");
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
    //Get candidates
    getElectionInfo();
  }, [modalState]);

  const getElectionInfo = () => {
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
              let candidateIds = Object.keys(data?.candidates);
              const candidatesInfo = candidateIds?.map(
                (c_id) => candidates[c_id.trim()]
              );
              data = { ...data, candidatesInfo, id: item.id };
              tempArray.push(data);
            });
            setTableData(tempArray);
          })
          .catch((err) => console.log("An error occurred fetching elections"));
      })
      .catch((err) => console.log("An error occurred fetching elections"));
  };

  const toggleCreateElectionsForm = (
    initialData = null,
    header = "Create an Election"
  ) => {
    dispatch(
      showModal({
        header: header,
        type: "createElection",
        data: initialData,
      })
    );
  };

  const handleDeleteAction = async () => {
    try {
      await deleteDoc(doc(db, "elections", recordToDelete?.id));
      getElectionInfo();
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
          onClick={() => toggleCreateElectionsForm(null, "Create an Election")}
        >
          Create an Election
        </Button>
      </div>

      <Table columns={columns} dataSource={tableData} />
    </div>
  );
};

export default ElectionsPage;
