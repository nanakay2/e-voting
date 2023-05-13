import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./redux/store";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import VotingPortalLogin from "./pages/VotingPortalLogin";
import VotingPortal from "./pages/VotingPortal";
import ElectionResults from "./pages/ElectionResults";
import PasswordReset from "./pages/PasswordReset";

const router = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminLogin />,
  },
  {
    path: "/admin/dashboard",
    element: <AdminLayout />,
  },
  {
    path: "/voting-portal",
    element: <VotingPortal />,
  },
  {
    path: "/",
    element: <VotingPortalLogin />,
  },
  {
    path: "/election-results",
    element: <ElectionResults />,
  },
  {
    path: "/reset-password/:userId",
    element: <PasswordReset />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

reportWebVitals();
