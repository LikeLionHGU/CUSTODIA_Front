import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import Home from "../page/home";
import Login from "../page/login";
import Signup from "../page/signup";
import Sehe from "../page/sahe";
import AsStartPage from "../page/AsStartPage";
import ProductInfoPage from "../page/ProductInfoPage";
import MyAsListPage from "../page/MyAsListPage";
import PickAsPage from "../page/PickAsPage";
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
        path: "my-as-list",
        element: <MyAsListPage />,
      },
      {
        path: "pick-as",
        element: <PickAsPage />,
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
