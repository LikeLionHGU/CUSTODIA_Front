import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import AsGuideModal from "../components/AsGuideModal";
import helpIcon from "../assets/icon_help.svg";
import * as member from "../api/member";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, toErrorMessage } from "../api/format";

// 명세 부록 B: PICKUP_BOOKED 라벨의 뒷부분("수거 대기 중")을 강조색으로 표시한다
const HIGHLIGHT_BY_STATUS = { PICKUP_BOOKED: "수거 대기 중" };

/** 명세 1-3: 완료 건은 expectedCompletedAt 대신 completedAt 을 표시한다 */
function buildStatusText(item) {
  if (item.completedAt) return `${item.statusLabel} · 완료 ${formatKoreanDate(item.completedAt)}`;
  if (item.expectedCompletedAt) {
    return `${item.statusLabel} · 예상 완료 ${formatKoreanDate(item.expectedCompletedAt)}`;
  }
  return item.statusLabel;
}

function renderAsItemStatus(item) {
  const text = buildStatusText(item);
  const highlight = HIGHLIGHT_BY_STATUS[item.status];
  const highlightIndex = highlight ? text.indexOf(highlight) : -1;
  if (highlightIndex === -1) return text;

  return (
    <>
      {text.slice(0, highlightIndex)}
      <AsItemHighlight>{highlight}</AsItemHighlight>
    </>
  );
}

export default function MCM_Home() {
  const navigate = useNavigate();
  const [guideOpen, setGuideOpen] = useState(false);

  // 명세 1-3: 서버가 최대 5건·최신순으로 잘라서 준다
  const { data, loading, error } = useApiQuery(() => member.getHome(), []);
  const asCaseList = data?.asCaseList ?? [];

  const handleAsDetail = (item) => {
    navigate("/my-as-detail", { state: { asNo: item.asNo } });
  };

  return (
    <Page>
      <Body>
        <Columns>
          <LeftColumn>
            <Hero>
              <HeroTitle>CUSTODIA 케어</HeroTitle>
              <HeroDescription>
                고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
              </HeroDescription>
            </Hero>

            <AsListSection>
              <AsList>
                {loading && <EmptyAsList>불러오는 중…</EmptyAsList>}
                {!loading && error && <EmptyAsList>{toErrorMessage(error)}</EmptyAsList>}
                {!loading && !error && asCaseList.length === 0 && (
                  <EmptyAsList>아직 AS 내역이 없어요.</EmptyAsList>
                )}
                {!loading &&
                  !error &&
                  asCaseList.map((item) => (
                    <AsItem key={item.asNo}>
                      <AsItemInfo>
                        <AsItemName>
                          {item.modelName} · {item.asNo}
                        </AsItemName>
                        <AsItemStatus>{renderAsItemStatus(item)}</AsItemStatus>
                      </AsItemInfo>
                      <DetailButton variant="stroke" onClick={() => handleAsDetail(item)}>
                        상세보기
                      </DetailButton>
                    </AsItem>
                  ))}
              </AsList>
              <ViewAllLink type="button" onClick={() => navigate("/my-as-list")}>
                전체 접수 내역 보기
              </ViewAllLink>
            </AsListSection>
          </LeftColumn>

          <RightColumn>
            <InfoCard>
              <InfoCardBody>
                <InfoCardTitleRow>
                  <InfoCardTitle>접수 시작</InfoCardTitle>
                  <GuideButton
                    type="button"
                    onClick={() => setGuideOpen(true)}
                    aria-label="A/S접수 안내 열기"
                  >
                    <GuideIcon src={helpIcon} alt="" />
                  </GuideButton>
                </InfoCardTitleRow>
                <InfoCardText>아래 버튼을 눌러 제품 정보 입력을 시작하세요.</InfoCardText>
              </InfoCardBody>
              <Button variant="filled" onClick={() => navigate("/product-info")}>
                AS 접수 시작하기
              </Button>
            </InfoCard>

            <InfoCard>
              <InfoCardBody>
                <InfoCardTitle>AI 컨시어지 &amp; 상담원 연결</InfoCardTitle>
                <div>
                  <InfoCardText>
                    고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
                  </InfoCardText>
                  <InfoCardText>최종 수선 판단 및 비용 확정은 실물 진단 후 상담원이 안내합니다.</InfoCardText>
                </div>
              </InfoCardBody>
              <Button variant="filled" onClick={() => navigate("/pick-as")}>
                상담하기
              </Button>
            </InfoCard>
          </RightColumn>
        </Columns>
      </Body>

      <AsGuideModal open={guideOpen} onClose={() => setGuideOpen(false)} />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 60px 48px;
  box-sizing: border-box;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 639fr) minmax(320px, 660fr);
  align-items: start;
  gap: 45px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 52px;
  padding-bottom: 32px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Hero = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
`;

const HeroTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const HeroDescription = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  line-height: 16px;
  color: #222;
`;

const AsListSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
`;

const AsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const AsItem = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 32px 0;
  border-top: 1px solid #d1d5db;

  &:last-child {
    border-bottom: 1px solid #d1d5db;
  }
`;

const AsItemInfo = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AsItemName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  color: #222;
`;

const AsItemStatus = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 14px;
  color: #313131;
`;

const AsItemHighlight = styled.span`
  color: #fb4103;
`;

const DetailButton = styled(Button)`
  width: 121px;
  background: #fff;
`;

const EmptyAsList = styled.p`
  width: 100%;
  box-sizing: border-box;
  margin: 0;
  padding: 32px 0;
  border-top: 1px solid #d1d5db;
  border-bottom: 1px solid #d1d5db;
  text-align: center;
  font-size: 14px;
  color: #313131;
`;

const ViewAllLink = styled.button`
  border: none;
  border-bottom: 1px solid #313131;
  background: none;
  padding: 4px 0;
  font-size: 14px;
  line-height: 14px;
  color: #313131;
  cursor: pointer;
`;

const InfoCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 32px;
  background: #f0f0f0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const InfoCardBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
`;

const InfoCardTitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoCardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 16px;
  color: #222;
`;

const InfoCardText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 26px;
  color: #222;
`;

const GuideButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const GuideIcon = styled.img`
  width: 18px;
  height: 18px;
`;
