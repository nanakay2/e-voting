import { Button, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const DeleteModal = ({ show, onClose, name, confirm }) => {
  return (
    <Modal
      title={
        <p style={{ textAlign: "center", fontSize: 28, fontWeight: 700 }}>
          Delete Record
        </p>
      }
      open={show}
      onOk={onClose}
      onCancel={onClose}
      footer={[]}
    >
      <div style={{ textAlign: "center" }}>
        Are you sure you want to <b>Delete</b> the record for {name} ?
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          gap: 30,
          justifyContent: "center",
          marginTop: 40,
        }}
      >
        <Button
          type="primary"
          shape="round"
          size="large"
          style={{
            fontWeight: 500,
            backgroundColor: "#3c28dc",
            color: "white",
            borderColor: "#3c28dc",
          }}
          onClick={confirm}
        >
          Delete
        </Button>
        <Button
          shape="round"
          size="large"
          style={{ fontWeight: 500, color: "#3c28dc" }}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
};
export default DeleteModal;
