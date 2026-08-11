import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "../assets/logo_main.svg";
import Profile from "../assets/icon_profile.svg";

export default function Header() {
    return <Container>
        <LogoImage src={Logo} />
        <NavigatorContainer><Links /></NavigatorContainer>
        <ProfileImage src={Profile} />
    </Container>;
}

function Links() {
  return (
    <>
      <NavigatorText to="/estimate">A/S 견적</NavigatorText>
      <NavigatorText to="/request">A/S 접수</NavigatorText>
      <NavigatorText to="/history">A/S 조회</NavigatorText>
      <NavigatorText to="/consult">A/S 상담</NavigatorText>
    </>
  );
}

const Container = styled.div`
    display: flex;
    align-items: center; 
    justify-content: space-between; 
    width: 100%;
    height: 80px;
    padding: 0 24px;
    background-color: white;
    border-bottom: 1px solid #f2eeee;

    @media (max-width: 640px) {
      height: 68px;
      padding: 0 18px;
    }
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
  gap: 24px;

  @media (max-width: 640px) {
    display: none;
  }
`
const NavigatorText = styled(Link)`
    color:black;
    font-size: 13px;
    font-weight: 600;
`
