import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../page/home";
import Sehe from "../page/sahe";
import AsStartPage from "../page/AsStartPage";
import ProductInfoPage from "../page/ProductInfoPage";

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
      {
        path: "as-start",
        element: <AsStartPage />,

      },
      {
        path: "product-info",
        element: <ProductInfoPage />,
      },
    ],
  },
]);

export default router;
