import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Login from "../page/login";
import Signup from "../page/signup";
import Sehe from "../page/sahe";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "signup",
        element: <Signup />,
      },
      {
        path: "sehae",
        element: <Sehe />,
      },
    ],
  },
]);

export default router;
