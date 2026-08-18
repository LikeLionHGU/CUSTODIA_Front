import { Outlet } from "react-router-dom";
import styled from "styled-components";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

/**
 * 모든 화면이 공유하는 셸.
 * Header가 fixed라 Content에 헤더 높이만큼 상단 여백을 준다.
 */
export default function MainLayout() {
  return (
    <Page>
      <Header />
      <Content>
        <Outlet />
      </Content>
      <Footer />
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
