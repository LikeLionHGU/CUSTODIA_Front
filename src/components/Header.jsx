import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "../assets/logo_main.svg";
import Profile from "../assets/icon_profile.svg";

export default function Header() {
    return <Container>
        <LogoLink to="/"><LogoImage src={Logo} /></LogoLink>
        <NavigatorContainer><Links /></NavigatorContainer>
        <ProfileImage src={Profile} />
    </Container>;
}

function Links() {
  return (
    <>
      <NavigatorText to="/product-info">AI 견적</NavigatorText>
      <NavigatorText to="/as-start">A/S 접수</NavigatorText>
      <NavigatorText to="/my-as-list">A/S 조회</NavigatorText>
      <NavigatorText to="/pick-as">AI 상담</NavigatorText>
    </>
  );
}

const Container = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 100;
    width: 100%;
    height: 80px;
    padding: 0 48px;
    background-color: white;
    border-bottom: 1px solid #ededed;
    box-sizing: border-box;

    @media (max-width: 640px) {
      height: 68px;
      padding: 0 18px;
    }
`
const LogoLink = styled(Link)`
    display: flex;
    align-items: center;
`
const LogoImage = styled.img`
    height:27.18px;
`
const ProfileImage = styled.img`
    height:20px;
`
const NavigatorContainer = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 48px;

  @media (max-width: 640px) {
    display: none;
  }
`
const NavigatorText = styled(Link)`
    color: #000;
    font-family: "Noto Sans KR", "Pretendard", sans-serif;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 8px 0;
`
