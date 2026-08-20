import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";

import { isAuthenticated } from "../api/client";
import { useLanguage } from "../i18n";
import Logo from "../assets/logo_custodia.svg";
import Profile from "../assets/icon_profile.svg";

/** 상단 내비게이션. 경로가 일치하는 메뉴 아래로 밑줄이 미끄러져 이동한다. */
const NAV_ITEMS = [
  { label: "A/S 접수", to: "/product-info" },
  { label: "A/S 조회", to: "/my-as-list" },
  { label: "AI 상담", to: "/pick-as" },
];

export default function Header() {
  const { pathname } = useLocation();
  const { lang, t } = useLanguage();

  const navRef = useRef(null);
  const itemRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, visible: false });
  const [animated, setAnimated] = useState(false);

  const activeIndex = NAV_ITEMS.findIndex((item) => item.to === pathname);

  // 토큰은 localStorage 에 있어 렌더 중 읽어도 된다.
  // 로그인·로그아웃 뒤에는 화면이 이동하므로 pathname 이 바뀔 때 다시 확인된다.
  const loggedIn = isAuthenticated();

  /**
   * 활성 메뉴의 위치·너비를 재서 밑줄에 그대로 넘긴다.
   * 경로가 바뀔 때뿐 아니라 언어 전환·창 크기 변경·웹폰트 적용으로
   * 라벨 너비가 달라질 때도 다시 재야 하므로 ResizeObserver 를 함께 건다.
   */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;

    const update = () => {
      const target = activeIndex >= 0 ? itemRefs.current[activeIndex] : null;
      // 활성 메뉴가 없으면 마지막 위치를 유지한 채 사라지게 한다 (다음 진입 시 그 자리에서 출발)
      if (!target) {
        setIndicator((prev) => (prev.visible ? { ...prev, visible: false } : prev));
        return;
      }
      setIndicator({ left: target.offsetLeft, width: target.offsetWidth, visible: true });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(nav);
    itemRefs.current.forEach((element) => element && observer.observe(element));
    return () => observer.disconnect();
  }, [activeIndex, lang]);

  // 첫 측정이 끝난 다음 프레임부터 전환을 켠다 — 새로고침 때 밑줄이 왼쪽에서 밀려오지 않도록.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Container>
      <LogoLink to="/">
        <LogoImage src={Logo} alt="CUSTODIA" />
      </LogoLink>

      {/* 내비게이션과 프로필은 우측에 48px 간격의 한 그룹으로 묶인다 */}
      <RightGroup>
        <Nav ref={navRef}>
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              $active={index === activeIndex}
              aria-current={index === activeIndex ? "page" : undefined}
            >
              {t(item.label)}
            </NavLink>
          ))}
          <NavIndicator
            aria-hidden="true"
            $animated={animated}
            $visible={indicator.visible}
            style={{
              transform: `translateX(${indicator.left}px)`,
              width: `${indicator.width}px`,
            }}
          />
        </Nav>

        {/* 로그인 상태면 마이페이지, 아니면 로그인 화면으로 보낸다 */}
        <ProfileLink
          to={loggedIn ? "/my-page" : "/login"}
          aria-label={loggedIn ? t("마이페이지") : t("로그인")}
        >
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

  @media (max-width: 640px) {
    gap: 16px;
  }
`;

const Nav = styled.nav`
  position: relative;
  display: flex;
  align-items: center;
  gap: 48px;

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  padding: 8px 0;
  color: ${(props) => (props.$active ? "#222" : "#6b6b65")};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: color 0.25s ease;

  &:hover {
    color: #222;
  }
`;

/**
 * 메뉴 아래를 미끄러지는 밑줄. 각 링크에 border-bottom 을 켜고 끄는 대신
 * 하나의 막대를 옮기기 때문에 메뉴 사이 이동이 이어져 보인다.
 */
const NavIndicator = styled.span`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: #222;
  border-radius: var(--radius-pill);
  transform-origin: left center;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: ${(props) =>
    props.$animated
      ? "transform 0.34s cubic-bezier(0.22, 1, 0.36, 1), width 0.34s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease"
      : "none"};

  @media (prefers-reduced-motion: reduce) {
    transition: opacity 0.2s ease;
  }
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
