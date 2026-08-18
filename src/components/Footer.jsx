import { Link } from "react-router-dom";
import styled from "styled-components";

import Logo from "../assets/logo_custodia_light.svg";

/** 링크 컬럼. Header의 NAV_ITEMS와 같은 방식으로 데이터에서 렌더한다. */
const LINK_COLUMNS = [
  {
    title: "서비스",
    links: [
      { label: "A/S 접수", to: "/product-info" },
      { label: "A/S 조회", to: "/my-as-list" },
      { label: "AI 상담", to: "/pick-as" },
    ],
  },
  {
    title: "고객 지원",
    // 아직 해당 화면이 없어 링크 대상이 정해지지 않은 항목들
    links: [
      { label: "자주 묻는 질문" },
      { label: "수선 가이드" },
      { label: "보증 정책 안내" },
      { label: "개인정보 처리방침" },
      { label: "이용약관" },
    ],
  },
];

/** 상담센터 전화번호. AgentContactModal과 같은 값을 쓴다. */
const CONTACTS = [
  { label: "고객 상담 대표번호", number: "1588-0000", hours: "평일 09:00 – 18:00" },
  { label: "AS 전담 직통번호", number: "1588-0001", hours: "평일 09:00 – 18:00 · 토 10:00 – 15:00" },
];

const LANGUAGES = ["KR", "EN", "DE"];

export default function Footer() {
  return (
    <Container>
      <Inner>
        <Columns>
          <BrandColumn>
            <LogoImage src={Logo} alt="CUSTODIA" />
          </BrandColumn>

          {LINK_COLUMNS.map((column) => (
            <Column key={column.title}>
              <ColumnTitle>{column.title}</ColumnTitle>
              <LinkList>
                {column.links.map((link) =>
                  link.to ? (
                    <FooterLink key={link.label} to={link.to}>
                      {link.label}
                    </FooterLink>
                  ) : (
                    <FooterText key={link.label}>{link.label}</FooterText>
                  ),
                )}
              </LinkList>
            </Column>
          ))}

          <Column>
            <ColumnTitle>상담센터</ColumnTitle>
            <ContactList>
              {CONTACTS.map((contact) => (
                <Contact key={contact.number}>
                  <ContactLabel>{contact.label}</ContactLabel>
                  <ContactNumber>{contact.number}</ContactNumber>
                  <ContactHours>{contact.hours}</ContactHours>
                </Contact>
              ))}
            </ContactList>
          </Column>
        </Columns>

        <BottomBar>
          <Copyright>
            © 2025 CUSTODIA. All rights reserved. | 사업자등록번호 123-45-67890 | 대표 Michael
            Michalsky | 서울특별시 강남구 테헤란로 123
          </Copyright>
          <Languages>
            {LANGUAGES.map((lang, index) => (
              <Language key={lang} $active={index === 0}>
                {lang}
              </Language>
            ))}
          </Languages>
        </BottomBar>
      </Inner>
    </Container>
  );
}

const Container = styled.footer`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #222;
`;

const Inner = styled.div`
  width: 100%;
  max-width: 1440px;
  padding: 56px 48px;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 40px 18px;
  }
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 200px repeat(3, minmax(0, 1fr));
  gap: 48px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Column = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BrandColumn = styled(Column)`
  gap: 16px;
`;

const LogoImage = styled.img`
  width: 117px;
  height: 17.92px;
`;

const ColumnTitle = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 15px;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #fff;
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const footerItem = `
  font-size: 12px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.5);
`;

const FooterLink = styled(Link)`
  ${footerItem}

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const FooterText = styled.p`
  ${footerItem}
  margin: 0;
`;

const ContactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Contact = styled.div`
  display: flex;
  flex-direction: column;
`;

const ContactLabel = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 16.5px;
  color: rgba(255, 255, 255, 0.6);
`;

const ContactNumber = styled.p`
  margin: 4px 0 0;
  font-size: 20px;
  font-weight: 300;
  line-height: 30px;
  letter-spacing: 0.5px;
  color: #fff;
`;

const ContactHours = styled.p`
  margin: 2px 0 0;
  font-size: 11px;
  line-height: 16.5px;
  color: rgba(255, 255, 255, 0.3);
`;

const BottomBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 48px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Copyright = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: rgba(255, 255, 255, 0.2);
`;

const Languages = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

/** 선택된 언어만 흰색, 나머지는 흐리게. 구분선은 가상 요소로 그린다. */
const Language = styled.span`
  position: relative;
  font-size: 11px;
  line-height: 16.5px;
  color: ${(props) => (props.$active ? "#fff" : "rgba(255, 255, 255, 0.3)")};

  &:not(:last-child)::after {
    content: "";
    position: absolute;
    top: 50%;
    right: -8px;
    width: 1px;
    height: 12px;
    transform: translateY(-50%);
    background: rgba(255, 255, 255, 0.15);
  }
`;
