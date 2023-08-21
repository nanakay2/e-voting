import React, { useEffect, useState } from "react";
import {
  UserOutlined,
  UsergroupAddOutlined,
  FlagOutlined,
  DropboxOutlined,
  PoweroffOutlined,
} from "@ant-design/icons";
import UniversityLogo from "../images/torrens_university_australia_logo.svg";
import { Layout, Menu, theme } from "antd";
import UsersPage from "../pages/Users";
import DepartmentsPage from "../pages/Departments";
import ElectionsPage from "../pages/Elections";
import CandidatesPage from "../pages/Candidates";
import Modal from "./Modal";
import { useNavigate } from "react-router";
import useLocalStorage from "../hooks/useLocalStorage";
import styled from "styled-components";

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
  getItem("Students", "1", <UserOutlined />),
  getItem("Candidates", "2", <UsergroupAddOutlined />),
  getItem("Departments", "3", <FlagOutlined />),
  getItem("Elections", "4", <DropboxOutlined />),
];

const AdminLayout = ({ children }) => {
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
      <StyledLayout
        style={{
          minHeight: "100vh",
          backgroundColor: "black !important",
        }}
      >
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          style={{ backgroundColor: "white" }}
        >
          <div
            style={{
              height: 32,
              margin: 16,
              marginBottom: 80,
            }}
          >
            <img src={UniversityLogo} />
          </div>
          <StyledMenu
            theme="dark"
            defaultSelectedKeys={["1"]}
            onSelect={(e) =>
              setActiveNav(items.find((item) => item.key === e.key))
            }
            style={{ backgroundColor: "white", color: "black" }}
            mode="inline"
            items={items}
            className=""
          />
        </Sider>
        <Layout className="site-layout">
          <div
            style={{
              // zIndex: 5000,
              height: 80,
              // backgroundColor: "white !important",
              //   borderBottom: "solid 1px #737373",
              display: "flex",
              flexDirection: "row",
              paddingLeft: 35,
              paddingRight: 35,
              paddingTop: 18,
              paddingBottom: 10,
              justifyContent: "space-between",
              gap: 30,
              background: "#ffffff",
              boxShadow: "0px 3px 0px rgba(0,0,0,0.1)",
            }}
          >
            <h4
              style={{
                fontSize: 22,
                color: "#393939",
                padding: 0,
                margin: 0,
                marginTop: 10,
              }}
            >
              E-Voting Admin Portal
            </h4>

            <div style={{ display: "flex", flexDirection: "row", gap: 25 }}>
              <div>
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: 14,
                    color: "#393939",
                  }}
                >
                  Hello
                </p>
                <p
                  style={{
                    margin: 0,
                    padding: 0,
                    fontSize: 18,
                    color: "#393939",
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
                <PoweroffOutlined style={{ fontSize: 22, color: "#393939" }} />
                <span
                  style={{
                    color: "#393939",
                    marginLeft: "5px",
                  }}
                >
                  Logout
                </span>
              </div>
            </div>
          </div>
          <Content
            style={{
              margin: "0 16px",
              paddingRight: 20,
              paddingLeft: 20,
              background: "#f5f5f5",
            }}
          >
            {activeNav?.key === "1" && <UsersPage title="Students" />}
            {activeNav?.key === "2" && <CandidatesPage title="Candidates" />}
            {activeNav?.key === "3" && <DepartmentsPage title="Departments" />}
            {activeNav?.key === "4" && <ElectionsPage title="Elections" />}
            {children}
          </Content>
        </Layout>
      </StyledLayout>
    </>
  );
};

const StyledMenu = styled(Menu)`
  .ant-menu-item-selected {
  }

  .ant-menu-item {
    :hover {
      color: #3c28dc !important;
    }
    .ant-menu-item-selected {
      color: white !important;
    }
  }

  .ant-menu-item-selected {
    background-color: #ff5101 !important;
    :hover {
      color: white !important;
    }
  }
`;

const StyledLayout = styled(Layout)`
  .ant-layout-sider-trigger {
    background-color: #3c28dc !important;
  }
`;
export default AdminLayout;
