import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import LoginRequiredModal from "../components/LoginRequiredModal.jsx";
import { onLoginRequired } from "../api/authEvents";

/**
 * 모든 화면이 공유하는 셸.
 * Header가 fixed라 Content에 헤더 높이만큼 상단 여백을 준다.
 *
 * 인증이 필요한 요청이 실패하면 화면마다 문구를 흘리는 대신 여기서 한 번만 안내한다.
 * 여러 요청이 동시에 실패해도 모달은 하나만 뜬다.
 */
export default function MainLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => onLoginRequired(() => setLoginRequired(true)), []);

  // 로그인·회원가입 화면에서는 안내가 겹치므로 띄우지 않는다.
  const isAuthScreen = pathname === "/login" || pathname === "/signup";

  const handleGoToLogin = () => {
    setLoginRequired(false);
    navigate("/login");
  };

  return (
    <Page>
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer />

      <LoginRequiredModal
        open={loginRequired && !isAuthScreen}
        onClose={() => setLoginRequired(false)}
        onLogin={handleGoToLogin}
      />
    </Page>
  );
}

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
`;

const Content = styled.main`
  flex: 1;
  padding-top: 80px;

  @media (max-width: 640px) {
    padding-top: 68px;
  }
`;
