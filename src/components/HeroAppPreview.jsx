import styled from "styled-components";

import { useT } from "../i18n";

/**
 * 랜딩 히어로 오른쪽에 놓이는 앱 목업과 떠 있는 배지.
 *
 * 랜딩 페이지(`MCM_Landing`)와 시연 페이지(`MCM_Demo`)가 같은 화면을 보여 줘야 해서
 * 한 곳에 두고 함께 쓴다. 한쪽만 손대면 시연 영상이 실제 화면과 어긋난다.
 */
export default function HeroAppPreview() {
  const t = useT();

  return (
    <HeroVisual>
      <AppPreview />
      <BadgeTopRight>
        <BadgeTitle>{t("분석 신뢰도 높음")}</BadgeTitle>
        <BadgeDesc>{t("제출 사진 3장 기반")}</BadgeDesc>
      </BadgeTopRight>
      <BadgeBottomLeft>
        <BadgeTitle>{t("보증 적용 가능")}</BadgeTitle>
        <BadgeDesc>{t("구매일 기준 2년 이내")}</BadgeDesc>
      </BadgeBottomLeft>
    </HeroVisual>
  );
}

function AppPreview() {
  const t = useT();

  return (
    <PreviewCard aria-hidden="true">
      <PreviewBar>
        <PreviewLogo>CUSTODIA</PreviewLogo>
        <PreviewNav>
          <span>{t("A/S 접수")}</span>
          <span>{t("A/S 조회")}</span>
          <span>{t("AI 상담")}</span>
        </PreviewNav>
      </PreviewBar>

      <PreviewBody>
        <PreviewSteps>
          <PreviewStep>
            <StepDot $done />
            {t("제품 정보")}
          </PreviewStep>
          <StepLine />
          <PreviewStep>
            <StepDot $done />
            {t("AI 예상 견적")}
          </PreviewStep>
          <StepLine />
          <PreviewStep $muted>
            <StepDot />
            {t("픽업 예약")}
          </PreviewStep>
        </PreviewSteps>

        <PreviewCards>
          <PreviewPanel>
            <PanelTitle>{t("제품 정보 요약")}</PanelTitle>
            <ThumbRow>
              <ThumbBox />
              <ThumbBox />
              <ThumbBox />
            </ThumbRow>
            <PanelRow>
              <PanelLabel>{t("제품명")}</PanelLabel>
              <PanelValue>MCM 클래식 백팩</PanelValue>
            </PanelRow>
            <PanelRow $last>
              <PanelLabel>{t("손상 부위")}</PanelLabel>
              <PanelValue>{t("스트랩 연결부")}</PanelValue>
            </PanelRow>
          </PreviewPanel>

          <PreviewPanel>
            <PanelTitle>{t("예상 수선 비용")}</PanelTitle>
            <PanelRow>
              <PanelLabel>{t("하드웨어 교체")}</PanelLabel>
              <PanelValue>₩80,000~</PanelValue>
            </PanelRow>
            <PanelRow>
              <PanelLabel>{t("스티칭 수선")}</PanelLabel>
              <PanelValue>₩40,000~</PanelValue>
            </PanelRow>
            <TotalRow>
              <span>{t("예상 합계")}</span>
              <span>₩120,000~190,000</span>
            </TotalRow>
          </PreviewPanel>
        </PreviewCards>
      </PreviewBody>
    </PreviewCard>
  );
}

/** 목업과 배지가 서로 겹쳐 놓이는 무대. 배지는 이 상자를 기준으로 배치된다. */
const HeroVisual = styled.div`
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 0;
`;

const PreviewCard = styled.div`
  width: 100%;
  max-width: 504px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ededed;
  border-radius: 16px;
  box-shadow: 0 24px 60px -20px rgba(34, 34, 34, 0.25);
  /* 디자인처럼 살짝 기울여 둔다 */
  transform: rotate(1.2deg);
`;

const PreviewBar = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 18px;
  border-bottom: 1px solid #ededed;
`;

const PreviewLogo = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  color: #222;
`;

const PreviewNav = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 10px;
  line-height: 15px;
  color: #919191;
`;

const PreviewBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  background: #f9f9f9;
`;

const PreviewSteps = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const PreviewStep = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10.5px;
  font-weight: ${(props) => (props.$muted ? 400 : 700)};
  line-height: 15.75px;
  white-space: nowrap;
  color: ${(props) => (props.$muted ? "#919191" : "#222")};
`;

const StepDot = styled.span`
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  box-sizing: border-box;
  border-radius: var(--radius-pill);
  background: ${(props) => (props.$done ? "#222" : "transparent")};
  border: 1px solid ${(props) => (props.$done ? "#222" : "#919191")};
`;

const StepLine = styled.span`
  flex: 1 1 auto;
  min-width: 12px;
  height: 1px;
  background: #ededed;
`;

const PreviewCards = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

const PreviewPanel = styled.div`
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 13px 14px 19px;
  background: #fff;
  border: 1px solid #ededed;
  border-radius: 10px;
`;

const PanelTitle = styled.p`
  margin: 0 0 6px;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 17.25px;
  color: #222;
`;

const ThumbRow = styled.div`
  display: flex;
  gap: 6px;
  padding-bottom: 8px;
`;

const ThumbBox = styled.span`
  width: 34px;
  height: 34px;
  border: 1px solid #ededed;
  border-radius: 6px;
  background: linear-gradient(135deg, #d6d6d6 0%, #f1f1f1 100%);
`;

const PanelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 5px 0;
  border-bottom: ${(props) => (props.$last ? "none" : "1px dashed #ededed")};
`;

const PanelLabel = styled.span`
  font-size: 10.5px;
  line-height: 15.75px;
  color: #6b6b65;
`;

const PanelValue = styled.span`
  font-size: 10.5px;
  font-weight: 700;
  line-height: 15.75px;
  text-align: right;
  color: #222;
`;

const TotalRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 6px;
  padding: 10px 12px;
  background: #222;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
  line-height: 16.5px;
  color: #fff;
`;

/** 목업 위에 떠 있는 라벨. 좁은 화면에서는 목업을 가려 숨긴다. */
const badge = `
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: #222;
  border-radius: 10px;
  box-shadow: 0 14px 30px -10px rgba(0, 0, 0, 0.4);

  @media (max-width: 640px) {
    display: none;
  }
`;

const BadgeTopRight = styled.div`
  ${badge}
  top: 0;
  right: 0;
  transform: rotate(-3deg);
`;

const BadgeBottomLeft = styled.div`
  ${badge}
  bottom: 0;
  left: 0;
  transform: rotate(2deg);
`;

const BadgeTitle = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  line-height: 16.5px;
  color: #fff;
  white-space: nowrap;
`;

const BadgeDesc = styled.p`
  margin: 0;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9.5px;
  line-height: 14.25px;
  color: #919191;
  white-space: nowrap;
`;
