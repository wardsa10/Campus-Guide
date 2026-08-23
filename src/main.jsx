import { createRoot } from "react-dom/client";
import "./index.css";

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./hooks/UserContext.jsx";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Home from "./pages/Home.jsx";
import Login from "./pages/login/Login.jsx";
import Register from "./pages/register/Register.jsx";
import University from "./pages/university/University.jsx";
import EditUniversity from "./pages/editUniversity/EditUniversity.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/register",
        element: <Register />,
      },
      {
        path: "university/:id",
        element: <University />,
      },
      {
        path: "university/edit/:id",
        element: <EditUniversity />,
      },
    ],
  },
]);

// Replace browser alert with React Toastify
window.alert = (message) => {
  toast.info(message);
};

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <RouterProvider router={router} />

    <ToastContainer
      position="top-right"
      autoClose={3000}
      closeOnClick
      pauseOnHover
    />
  </UserProvider>,
);
