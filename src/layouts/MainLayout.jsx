import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Header from "../components/Header.jsx";

export default function MainLayout() {
  return (
    <>
      <Header />

      <Content>
        <Outlet />
      </Content>
    </>
  );
}

const Content = styled.div`
  padding-top: 80px;

  @media (max-width: 640px) {
    padding-top: 68px;
  }
`;
