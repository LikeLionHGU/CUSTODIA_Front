import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../page/home";
import Sehe from "../page/sahe";

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
        path: "sehae",
        element: <Sehe />,
        
      },
    ],
  },
]);

export default router;
