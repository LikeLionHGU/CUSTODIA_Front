import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../layouts/MainLayout";
import HomeRoute from "./HomeRoute.jsx";
import MCM_Login from "../page/MCM_Login";
import MCM_Signup from "../page/MCM_Signup";
import MCM_MyPage from "../page/MCM_MyPage";
import MCM_Demo from "../page/MCM_Demo";
import AS_ProductInfo from "../page/AS_ProductInfo";
import AS_AiEstimate from "../page/AS_AiEstimate";
import AS_MyList from "../page/AS_MyList";
import AS_MyDetail from "../page/AS_MyDetail";
import AS_Pick from "../page/AS_Pick";
import AS_AiConcierge from "../page/AS_AiConcierge";
import AS_NoRecord from "../page/AS_NoRecord";
import AS_PickupReservation from "../page/AS_PickupReservation";
import AS_ReservationComplete from "../page/AS_ReservationComplete";

// vite 의 base 값. GitHub Pages 처럼 하위 경로에 올라가면 라우터도 그 밑에서 매칭해야 한다.
// createBrowserRouter 는 끝 슬래시가 없는 형태를 기대하므로 떼어 낸다.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "");

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      //===============홈 (로그인 전 랜딩 / 로그인 후 접수 내역)==========================
      {
        index: true,
        element: <HomeRoute />,
      },
      //===============로그인==========================
      {
        path: "login",
        element: <MCM_Login />,
      },
      //===============회원가입==========================
      {
        path: "signup",
        element: <MCM_Signup />,
      },

      //===============서비스 흐름 시연==========================
      {
        path: "demo",
        element: <MCM_Demo />,
      },

      //===============마이페이지==========================
      {
        path: "my-page",
        element: <MCM_MyPage />,
      },

      //===============제품 정보 입력 화면==========================
      {
        path: "product-info",
        element: <AS_ProductInfo />,
      },
      //===============AI 예상 견적 결과 화면==========================
      {
        path: "ai-estimate",
        element: <AS_AiEstimate />,
      },
      //===============픽업 예약==========================
      {
        path: "pickup-reservation",
        element: <AS_PickupReservation />,
      },
      //===============픽업 예약 완료==========================
      {
        path: "reservation-complete",
        element: <AS_ReservationComplete />,
      },
      //===============나의 AS 내역 (리페어 패스포트)==========================
      {
        path: "my-as-list",
        element: <AS_MyList />,
      },
      //===============리페어 패스포트 상세==========================
      {
        path: "my-as-detail",
        element: <AS_MyDetail />,
      },
      //===============상담할 AS 접수 건 선택==========================
      {
        path: "pick-as",
        element: <AS_Pick />,
      },
      //===============AI 컨시어지 상담==========================
      {
        path: "ai-concierge",
        element: <AS_AiConcierge />,
      },
      //===============연결된 AS 이력 없음==========================
      {
        path: "no-record",
        element: <AS_NoRecord />,
      },

    ],
  },
], { basename });

export default router;
