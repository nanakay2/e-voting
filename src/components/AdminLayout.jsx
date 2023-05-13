import {
  FileOutlined,
  PieChartOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  FlagOutlined,
  DropboxOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, theme } from "antd";
import { useEffect, useState } from "react";
import UsersPage from "../pages/Users";
import PartiesPage from "../pages/Parties";
import ElectionsPage from "../pages/Elections";
import CandidatesPage from "../pages/Candidates";
import Modal from "./Modal";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import useLocalStorage from "../hooks/useLocalStorage";

const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
  return {
    key,
    icon,
    children,
    label,
  };
}

const items = [
  getItem("Users", "1", <UserOutlined />),
  getItem("Candidates", "2", <UsergroupAddOutlined />),
  getItem("Parties", "3", <FlagOutlined />),
  getItem("Elections", "4", <DropboxOutlined />),
];

const AdminLayout = ({ children }) => {
  // const user = useSelector((state) => state.user);
  const [user, setUser] = useLocalStorage("user");
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeNav, setActiveNav] = useState(items[0]);

  useEffect(() => {
    if (!user || user?.type !== "admin") navigate("/admin", { replace: true });
  }, []);

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  return (
    <>
      <Modal />
      <Layout
        style={{
          minHeight: "100vh",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
        >
          <div
            style={{
              height: 32,
              margin: 16,
              // background: "rgba(255, 255, 255, 0.2)",
            }}
          />
          <Menu
            theme="dark"
            defaultSelectedKeys={["1"]}
            onSelect={(e) =>
              setActiveNav(items.find((item) => item.key === e.key))
            }
            mode="inline"
            items={items}
          />
        </Sider>
        <Layout className="site-layout">
          {/* <Header
            style={{
              padding: 0,
              background: colorBgContainer,
              margin: 0,
            }}
          > */}
          <div
            style={{
              zIndex: 5000,
              height: 80,
              backgroundColor: "white !important",
              //   borderBottom: "solid 1px #737373",
              display: "flex",
              flexDirection: "row",
              paddingLeft: 30,
              paddingRight: 30,
              paddingTop: 18,
              paddingBottom: 10,
              justifyContent: "flex-end",
              gap: 30,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  padding: 0,
                  fontSize: 14,
                  color: "#737373",
                }}
              >
                Hello
              </p>
              <p
                style={{
                  margin: 0,
                  padding: 0,
                  fontSize: 18,
                  color: "#737373",
                  fontWeight: 700,
                  // marginTop: 3,
                }}
              >
                {user?.name}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                cursor: "pointer",
                justifyContent: "center",
                alignItems: "center",
              }}
              onClick={() => {
                navigate("/admin", { replace: true });
              }}
            >
              <PoweroffOutlined style={{ fontSize: 22, color: "#737373" }} />
              <span style={{ color: "#737373", marginLeft: "5px" }}>
                Logout
              </span>
            </div>
          </div>
          {/* </Header> */}
          <Content
            style={{
              margin: "0 16px",
            }}
          >
            {activeNav?.key === "1" && <UsersPage title="Users" />}
            {activeNav?.key === "2" && <CandidatesPage title="Candidates" />}
            {activeNav?.key === "3" && <PartiesPage title="Parties" />}
            {activeNav?.key === "4" && <ElectionsPage title="Elections" />}
            {children}
          </Content>
        </Layout>
      </Layout>
    </>
  );
};
export default AdminLayout;
