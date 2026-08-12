import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../page/home";
import Login from "../page/login";
import Signup from "../page/signup";
import Sehe from "../page/sahe";
import AsStartPage from "../page/AsStartPage";
import ProductInfoPage from "../page/ProductInfoPage";
import AiEstimatePage from "../page/AiEstimatePage";
import MyAsListPage from "../page/MyAsListPage";
import MyAsDetailPage from "../page/MyAsDetailPage";
import PickAsPage from "../page/PickAsPage";
import AiConciergePage from "../page/AiConciergePage";
import PickupReservationPage from "../page/PickupReservationPage";
import ReservationCompletePage from "../page/ReservationCompletePage";

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
      {
        path: "as-start",
        element: <AsStartPage />,

      },
      {
        path: "product-info",
        element: <ProductInfoPage />,
      },
      {
        path: "ai-estimate",
        element: <AiEstimatePage />,
      },
      {
        path: "my-as-list",
        element: <MyAsListPage />,
      },
      {
        path: "my-as-detail",
        element: <MyAsDetailPage />,
      },
      {
        path: "pick-as",
        element: <PickAsPage />,
      },
      {
        path: "ai-concierge",
        element: <AiConciergePage />,
      },
      {
        path: "pickup-reservation",
        element: <PickupReservationPage />,
      },
      {
        path: "reservation-complete",
        element: <ReservationCompletePage />,
      },
    ],
  },
]);

export default router;
