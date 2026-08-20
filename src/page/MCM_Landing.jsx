import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Button from "../components/Button";
import AsGuideModal from "../components/AsGuideModal";
import AgentContactModal from "../components/AgentContactModal";
import HeroAppPreview from "../components/HeroAppPreview";
import { useT } from "../i18n";

// 파트너 브랜드 띠. 로고 에셋이 없어 디자인처럼 워드마크로 나열한다.
const BRANDS = ["MCM", "COACH", "FURLA", "LONGCHAMP", "TUMI"];

const STATS = [
  {
    value: "4~8%",
    label: "CX 우수기업의 매출 성장폭",
    source: 'McKinsey, "The State of Luxury Goods in 2025"',
  },
  {
    value: "89%",
    label: "“서비스가 제품만큼 중요하다”고 대답한 명품 소비자 비율",
    source: 'McKinsey, "The State of Luxury Goods in 2025"',
  },
  {
    value: "94%",
    label: "AI가 서비스 경험을 향상시킬 수 있다고 대답한 럭셔리 소비자",
    source: 'EY, "EY Luxury Client Index 2026"',
  },
];

const STEPS = [
  {
    tag: "01 · UPLOAD",
    title: "사진 업로드",
    desc: "손상 부위 사진을 올리면 AI가 유형과 심각도를 분석합니다.",
  },
  {
    tag: "02 · ESTIMATE",
    title: "예상 비용 확인",
    desc: "확정 견적이 아닌 범위로 안내해 실물 진단과의 오차를 투명하게 관리합니다.",
  },
  {
    tag: "03 · PICKUP",
    title: "픽업 예약",
    desc: "매장 방문 없이 원하는 시간·장소에서 신원 확인된 기사가 인계받습니다.",
  },
  {
    tag: "04 · TRACK",
    title: "실시간 추적",
    desc: "NFC 기반 디지털 리페어 패스포트로 진행 상황을 언제든 확인합니다.",
  },
];

const PROVEN = [
  { title: "Sotheby’s Watch Services", desc: "보험 포함 자택 픽업" },
  { title: "Chanel & Moi", desc: "NFC 기반 수선이력 기록" },
  { title: "Otto · WorthToFix", desc: "AI 손상 견적, 정확도 ~85%" },
  { title: "Four Seasons Chat", desc: "100개 언어 AI 컨시어지" },
];

export default function MCM_Landing() {
  const navigate = useNavigate();
  const t = useT();

  const [guideOpen, setGuideOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);

  const startRequest = () => navigate("/product-info");

  return (
    <Page>
      {/* 히어로 */}
      <Hero>
        <HeroInner>
          <HeroText>
            <HeroTitle>
              {t("명품 AS,")}
              <br />
              {t("이제는 예측 가능하게")}
            </HeroTitle>
            <HeroDesc>
              {t(
                "사진 한 장으로 예상 수선비를 확인하고, 픽업부터 완료까지 실시간으로 추적하세요. 브랜드 매장에 가지 않아도 됩니다.",
              )}
            </HeroDesc>
            <HeroActions>
              <Button type="button" size="big" onClick={startRequest}>
                {t("AS 접수 시작하기")}
              </Button>
              <Button type="button" size="big" variant="stroke" onClick={() => setGuideOpen(true)}>
                {t("이용 방법 보기")}
              </Button>
            </HeroActions>
          </HeroText>

          <HeroAppPreview />
        </HeroInner>
      </Hero>

      {/* 파트너 브랜드 띠 */}
      <BrandStrip>
        <BrandInner>
          <BrandCaption>{t("DESIGNED FOR MASSTIGE LEATHER GOODS BRANDS")}</BrandCaption>
          <BrandList>
            {BRANDS.map((brand) => (
              <BrandName key={brand}>{brand}</BrandName>
            ))}
          </BrandList>
        </BrandInner>
      </BrandStrip>

      {/* 지표 */}
      <Section>
        <SplitInner>
          <SplitText>
            <SectionTitle>{t("애프터서비스가 곧 브랜드 경험입니다")}</SectionTitle>
            <SectionDesc>
              {t(
                "디자인·헤리티지·희소성은 따라할 수 있어도, 차별화된 애프터서비스는 쉽게 복제되지 않습니다.",
              )}
            </SectionDesc>
          </SplitText>
          <StatGrid>
            {STATS.map((stat) => (
              <StatCard key={stat.value}>
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{t(stat.label)}</StatLabel>
                <StatSource>{stat.source}</StatSource>
              </StatCard>
            ))}
          </StatGrid>
        </SplitInner>
      </Section>

      {/* 4단계 */}
      <StepSection>
        <StepInner>
          <StepHeading>
            <SectionTitle $centered>{t("4단계로 끝나는 AS 경험")}</SectionTitle>
            <SectionDesc $centered>
              {t("고객 리뷰에서 가장 많이 언급된 불편을 그대로 기능으로 설계했습니다.")}
            </SectionDesc>
          </StepHeading>
          <StepGrid>
            {STEPS.map((step, index) => (
              <StepCard key={step.tag}>
                <StepBody>
                  <StepTag>{step.tag}</StepTag>
                  <StepTitle>{t(step.title)}</StepTitle>
                  <StepDesc>{t(step.desc)}</StepDesc>
                </StepBody>
                {/* 마지막 단계 뒤에는 이어질 단계가 없다 */}
                {index < STEPS.length - 1 && <StepArrow aria-hidden="true">›</StepArrow>}
              </StepCard>
            ))}
          </StepGrid>
        </StepInner>
      </StepSection>

      {/* 검증된 방식 */}
      <Section>
        <SplitInner>
          <SplitText>
            <SectionTitle>{t("인접 럭셔리 업계에서 이미 검증된 방식")}</SectionTitle>
            <SectionDesc>
              {t(
                "CUSTODIA는 새로운 걸 발명하지 않습니다. 이미 통하는 서비스를 명품 가죽제품 카테고리에 맞게 통합할 뿐입니다.",
              )}
            </SectionDesc>
          </SplitText>
          <ProvenGrid>
            {PROVEN.map((item) => (
              <ProvenCard key={item.title}>
                <ProvenTitle>{item.title}</ProvenTitle>
                <ProvenDesc>{t(item.desc)}</ProvenDesc>
              </ProvenCard>
            ))}
          </ProvenGrid>
        </SplitInner>
      </Section>

      {/* 마무리 CTA */}
      <Section>
        <CtaInner>
          <CtaBand>
            <CtaTexts>
              <CtaTitle>{t("매장 없이, 5분 만에 AS 접수")}</CtaTitle>
              <CtaDesc>
                {t("MCM 등 파트너 브랜드는 매장·SKU 단위 구독으로, 고객은 무료로 이용합니다.")}
              </CtaDesc>
            </CtaTexts>
            <CtaActions>
              <CtaPrimary type="button" onClick={startRequest}>
                {t("AS 접수 시작하기")}
              </CtaPrimary>
              <CtaSecondary type="button" onClick={() => setContactOpen(true)}>
                {t("브랜드 도입 문의")}
              </CtaSecondary>
            </CtaActions>
          </CtaBand>
        </CtaInner>
      </Section>

      <AsGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
      <AgentContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
    </Page>
  );
}

/* ─────────────────────────────────────────────
   레이아웃
   ───────────────────────────────────────────── */

const Page = styled.div`
  width: 100%;
  background: #fff;
  box-sizing: border-box;
  text-align: left;
`;

const inner = `
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 150px;
  box-sizing: border-box;

  @media (max-width: 1200px) {
    padding: 0 48px;
  }

  @media (max-width: 640px) {
    padding: 0 18px;
  }
`;

const Section = styled.section`
  width: 100%;
  padding: 100px 0;

  @media (max-width: 900px) {
    padding: 64px 0;
  }
`;

const SplitInner = styled.div`
  ${inner}
  display: grid;
  grid-template-columns: minmax(0, 351fr) minmax(0, 729fr);
  align-items: center;
  gap: 60px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const SplitText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 34px;
  font-weight: 700;
  line-height: 46px;
  color: #222;
  text-align: ${(props) => (props.$centered ? "center" : "left")};

  @media (max-width: 640px) {
    font-size: 26px;
    line-height: 36px;
  }
`;

const SectionDesc = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 23.5px;
  color: #6b6b65;
  text-align: ${(props) => (props.$centered ? "center" : "left")};
`;

/* ─────────────────────────────────────────────
   히어로
   ───────────────────────────────────────────── */

const Hero = styled.section`
  width: 100%;
  padding: 100px 0;

  @media (max-width: 900px) {
    padding: 56px 0 72px;
  }
`;

const HeroInner = styled.div`
  ${inner}
  display: grid;
  grid-template-columns: minmax(0, 437fr) minmax(0, 504fr);
  align-items: center;
  gap: 60px;

  @media (max-width: 1000px) {
    grid-template-columns: 1fr;
    gap: 56px;
  }
`;

const HeroText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const HeroTitle = styled.h1`
  margin: 0;
  font-size: 50px;
  font-weight: 700;
  line-height: 65px;
  color: #000;

  @media (max-width: 640px) {
    font-size: 34px;
    line-height: 46px;
  }
`;

const HeroDesc = styled.p`
  margin: 0;
  font-size: 17px;
  line-height: 25.5px;
  color: #6b6b65;
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
`;

/* ─────────────────────────────────────────────
   파트너 브랜드 띠
   ───────────────────────────────────────────── */

const BrandStrip = styled.section`
  width: 100%;
  padding: 38px 0;
  background: #f9f9f9;
  border-top: 1px solid #ededed;
  border-bottom: 1px solid #ededed;
`;

const BrandInner = styled.div`
  ${inner}
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
`;

const BrandCaption = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #b4b4b4;
`;

const BrandList = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 36px;
`;

const BrandName = styled.span`
  font-size: 15px;
  font-weight: 500;
  letter-spacing: 1px;
  color: #919191;
`;

/* ─────────────────────────────────────────────
   지표
   ───────────────────────────────────────────── */

const StatGrid = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 29px;
  background: #fff;
  border: 1px solid #ededed;
  border-radius: var(--radius-card);
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.04);
`;

const StatValue = styled.p`
  margin: 0;
  font-size: 40px;
  font-weight: 700;
  line-height: 60px;
  color: #222;
`;

const StatLabel = styled.p`
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 21px;
  color: #313131;
`;

const StatSource = styled.p`
  margin: 20px 0 0;
  padding-top: 13px;
  border-top: 1px solid #ededed;
  font-size: 11px;
  line-height: 17.5px;
  color: #b4b4b4;
`;

/* ─────────────────────────────────────────────
   4단계
   ───────────────────────────────────────────── */

const StepSection = styled.section`
  width: 100%;
  padding: 100px 0;
  background: #f5f5f5;

  @media (max-width: 900px) {
    padding: 64px 0;
  }
`;

const StepInner = styled.div`
  ${inner}
  display: flex;
  flex-direction: column;
  gap: 40px;
`;

const StepHeading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StepGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 9px;

  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StepCard = styled.div`
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 30px 24px;
  background: #222;
  border: 1px solid #313131;
  border-radius: var(--radius-card);
`;

const StepBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 13px;
`;

const StepTag = styled.p`
  margin: 0;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  line-height: 18px;
  letter-spacing: 0.5px;
  color: #919191;
`;

const StepTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 24px;
  color: #fff;
`;

const StepDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: rgba(255, 255, 255, 0.5);
`;

const StepArrow = styled.span`
  flex-shrink: 0;
  font-size: 22px;
  line-height: 1;
  color: #6b6b65;

  @media (max-width: 1000px) {
    display: none;
  }
`;

/* ─────────────────────────────────────────────
   검증된 방식
   ───────────────────────────────────────────── */

const ProvenGrid = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const ProvenCard = styled.div`
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 43px 24px;
  background: #f9f9f9;
  border: 1px solid #ededed;
  border-radius: var(--radius-card);
  text-align: center;
`;

const ProvenTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  color: #222;
`;

const ProvenDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #6b6b65;
`;

/* ─────────────────────────────────────────────
   마무리 CTA
   ───────────────────────────────────────────── */

const CtaInner = styled.div`
  ${inner}
`;

const CtaBand = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  padding: 64px 56px;
  background: #222;
  border-radius: var(--radius-card);

  @media (max-width: 640px) {
    padding: 40px 24px;
  }
`;

const CtaTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CtaTitle = styled.p`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 42px;
  color: #fff;

  @media (max-width: 640px) {
    font-size: 22px;
    line-height: 32px;
  }
`;

const CtaDesc = styled.p`
  margin: 0;
  font-size: 15px;
  line-height: 22.75px;
  color: rgba(255, 255, 255, 0.6);
`;

const CtaActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

/**
 * 어두운 띠 안에 놓이는 버튼이라 공용 Button 의 색을 그대로 쓸 수 없다.
 * (검은 배경 위 검은 버튼이 된다) 크기·모서리는 공용 토큰을 따른다.
 */
const ctaButton = `
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 26px;
  border-radius: var(--radius-control);
  font-size: 13px;
  font-weight: 700;
  line-height: 13px;
  letter-spacing: 0.5px;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
`;

const CtaPrimary = styled.button`
  ${ctaButton}
  border: 1px solid #fff;
  background: #fff;
  color: #222;

  &:hover {
    background: #ededed;
    border-color: #ededed;
  }
`;

const CtaSecondary = styled.button`
  ${ctaButton}
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #fff;

  &:hover {
    border-color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
`;
