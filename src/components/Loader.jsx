import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";

const Loader = ({ color, size }) => (
  <Spin
    indicator={
      <LoadingOutlined
        style={{
          fontSize: size,
          color: color,
        }}
        spin
      />
    }
  />
);
export default Loader;
