import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import Logo from "../assets/logo_custodia.svg";
import Profile from "../assets/icon_profile.svg";

/** 상단 내비게이션. 경로가 일치하는 메뉴에 밑줄이 붙는다. */
const NAV_ITEMS = [
  { label: "A/S 접수", to: "/product-info" },
  { label: "A/S 조회", to: "/my-as-list" },
  { label: "AI 상담", to: "/pick-as" },
];

export default function Header() {
  const { pathname } = useLocation();

  return (
    <Container>
      <LogoLink to="/">
        <LogoImage src={Logo} alt="CUSTODIA" />
      </LogoLink>

      {/* 내비게이션과 프로필은 우측에 48px 간격의 한 그룹으로 묶인다 */}
      <RightGroup>
        <Nav>
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} $active={pathname === item.to}>
              {item.label}
            </NavLink>
          ))}
        </Nav>
        <ProfileLink to="/login" aria-label="로그인">
          <ProfileImage src={Profile} alt="" />
        </ProfileLink>
      </RightGroup>
    </Container>
  );
}

const Container = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  height: 80px;
  padding: 0 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #ededed;

  @media (max-width: 640px) {
    height: 68px;
    padding: 0 18px;
  }
`;

const LogoLink = styled(Link)`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 117px;
  height: 17.92px;
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 48px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 48px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 8px 0;
  border-bottom: 1px solid ${(props) => (props.$active ? "#000" : "transparent")};
  color: #000;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
`;

/** 프로필 아이콘. 누르면 로그인 화면으로 이동한다. */
const ProfileLink = styled(Link)`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 20px;
`;

const ProfileImage = styled.img`
  width: 16.231px;
  height: 16.231px;
`;
