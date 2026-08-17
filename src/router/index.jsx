import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import MCM_Home from "../page/MCM_Home";
import MCM_Login from "../page/MCM_Login";
import MCM_Signup from "../page/MCM_Signup";
import MCM_Sahe from "../page/MCM_Sahe";
import AS_Start from "../page/AS_Start";
import AS_ProductInfo from "../page/AS_ProductInfo";
import AS_AiEstimate from "../page/AS_AiEstimate";
import AS_MyList from "../page/AS_MyList";
import AS_MyDetail from "../page/AS_MyDetail";
import AS_Pick from "../page/AS_Pick";
import AS_AiConcierge from "../page/AS_AiConcierge";
import AS_PickupReservation from "../page/AS_PickupReservation";
import AS_ReservationComplete from "../page/AS_ReservationComplete";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <MCM_Home />,
      },
      {
        path: "login",
        element: <MCM_Login />,
      },
      {
        path: "signup",
        element: <MCM_Signup />,
      },
      {
        path: "sehae",
        element: <MCM_Sahe />,
      },
      {
        path: "as-start",
        element: <AS_Start />,

      },
      {
        path: "product-info",
        element: <AS_ProductInfo />,
      },
      {
        path: "ai-estimate",
        element: <AS_AiEstimate />,
      },
      {
        path: "my-as-list",
        element: <AS_MyList />,
      },
      {
        path: "my-as-detail",
        element: <AS_MyDetail />,
      },
      {
        path: "pick-as",
        element: <AS_Pick />,
      },
      {
        path: "ai-concierge",
        element: <AS_AiConcierge />,
      },
      {
        path: "pickup-reservation",
        element: <AS_PickupReservation />,
      },

      {
        path: "reservation-complete",
        element: <AS_ReservationComplete />,
      },
    ],
  },
]);

export default router;
