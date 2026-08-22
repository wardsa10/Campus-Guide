import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { UserProvider } from "./hooks/UserContext.jsx";

import Home from "./pages/Home.jsx";

import Login from "./pages/login/Login.jsx";

import MainLayout from "./layouts/MainLayout.jsx";
import Register from "./pages/register/Register.jsx";
import University from "./pages/university/University.jsx";
import EditUniversity from "./pages/editUniversity/EditUniversity.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        path: "/",
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

createRoot(document.getElementById("root")).render(
  <UserProvider>
    <RouterProvider router={router} />
  </UserProvider>,
);
