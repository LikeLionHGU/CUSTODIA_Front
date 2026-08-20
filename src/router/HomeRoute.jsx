import { useLocation } from "react-router-dom";

import { isAuthenticated } from "../api/client";
import MCM_Landing from "../page/MCM_Landing";
import MCM_Home from "../page/MCM_Home";

/**
 * `/` 한 주소가 로그인 상태에 따라 다른 화면을 보여 준다.
 * - 로그인 전: 서비스를 소개하는 랜딩 페이지
 * - 로그인 후: 접수 내역이 있는 홈
 *
 * 토큰은 localStorage 에 있어 렌더 중 읽어도 된다. 로그인·로그아웃 뒤에는
 * 모두 `/` 로 이동하므로 그때 이 컴포넌트가 다시 평가된다.
 */
export default function HomeRoute() {
  // 주소가 바뀔 때마다 다시 확인하도록 위치를 구독한다
  useLocation();

  return isAuthenticated() ? <MCM_Home /> : <MCM_Landing />;
}
