import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import AgentContactModal from "../components/AgentContactModal";
import noRecordBg from "../assets/icon_norecord_bg.svg";
import noRecordGlyph from "../assets/icon_norecord.svg";
import { useT } from "../i18n";

export default function AS_NoRecord() {
  const t = useT();
  const navigate = useNavigate();
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <Page>
      <Body>
        <Intro>
          <IconWrap>
            <IconBg src={noRecordBg} alt="" />
            <IconGlyph src={noRecordGlyph} alt="" />
          </IconWrap>
          <IntroText>
            <IntroTitle>{t("연결된 AS 이력 없음")}</IntroTitle>
            <IntroDescription>
              {t("조회 가능한 이전 AS 접수 건이 없습니다.")}
              <br />
              {t("아래 방법으로 문제 해결을 도와드립니다.")}
            </IntroDescription>
          </IntroText>
        </Intro>

        <Options>
          <OptionList>
            <OptionCard>
              <OptionTitle>{t("구매 기록 확인")}</OptionTitle>
              <OptionDescription>{t("제품 구매 기록과 보증 정보를 먼저 확인하세요.")}</OptionDescription>
              <Button type="button">{t("구매 내역 보기")}</Button>
            </OptionCard>

            <OptionCard>
              <OptionTitle>{t("AI 컨시어지 상담")}</OptionTitle>
              <OptionDescription>{t("제품 문제를 설명하고 AI 상담을 받으세요.")}</OptionDescription>
              {/* 명세 6-2: asNo 없이 상담을 시작하면 이력 없는 신규 상담(718) */}
              <Button type="button" onClick={() => navigate("/ai-concierge")}>
                {t("상담 시작하기")}
              </Button>
            </OptionCard>

            <OptionCard>
              <OptionTitle>{t("상담원 직통 연결")}</OptionTitle>
              <OptionDescription>{t("전문 상담원과 전화 또는 채팅으로 연결됩니다.")}</OptionDescription>
              <TextLinkButton type="button" onClick={() => setContactOpen(true)}>
                {t("상담원 연결")}
              </TextLinkButton>
            </OptionCard>
          </OptionList>

          <BottomButtons>
            <Button type="button" variant="stroke" onClick={() => navigate(-1)}>
              {t("이전으로")}
            </Button>
            <Button type="button" onClick={() => navigate("/")}>
              {t("홈으로")}
            </Button>
          </BottomButtons>
        </Options>
      </Body>

      <AgentContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  max-width: 792px;
  margin: 0 auto;
  padding: 52px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
`;

const Intro = styled.div`
  width: 270px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const IconWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 80px;
  height: 80px;
`;

const IconBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const IconGlyph = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 37px;
  height: 42.67px;
`;

const IntroText = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  text-align: center;
`;

const IntroTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const IntroDescription = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 26px;
  color: #313131;
`;

const Options = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 24px;
`;

const OptionList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const OptionTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const OptionDescription = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #919191;
`;

const TextLinkButton = styled.button`
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #222;
  text-decoration: underline;
  cursor: pointer;
`;

const BottomButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;
