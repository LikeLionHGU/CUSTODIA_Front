import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const MAX_VISIBLE_AS_ITEMS = 5;

// TODO: 백엔드 연동 시 이 목록을 API 응답으로 교체
const AS_ITEMS = [
  {
    id: "AS-2024-00312",
    productName: "MCM 클래식 백팩",
    status: "수선 진행 중 · 예상 완료 2025년 8월 4일",
  },
  {
    id: "AS-2024-00298",
    productName: "MCM 스타크 지갑",
    status: "검수 완료 · 예상 완료 2025년 7월 30일",
  },
  {
    id: "AS-2024-00271",
    productName: "MCM 미니 크로스백",
    status: "픽업 예약 완료 · 수거 대기 중",
    highlight: "수거 대기 중",
  },
];

function renderAsItemStatus(item) {
  if (!item.highlight) return item.status;

  const highlightIndex = item.status.indexOf(item.highlight);
  if (highlightIndex === -1) return item.status;

  const prefix = item.status.slice(0, highlightIndex);
  return (
    <>
      {prefix}
      <AsItemHighlight>{item.highlight}</AsItemHighlight>
    </>
  );
}

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-sizing: border-box;
  text-align: left;
`;

const BodyRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;

const Body = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 48px;
  box-sizing: border-box;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 1fr);
  align-items: start;
  gap: 48px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 52px;
  padding: 32px 0;
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
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const HeroDescription = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 400;
  color: #000;
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
  letter-spacing: 1px;
  color: #1f2937;
`;

const AsItemStatus = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1f2937;
`;

const AsItemHighlight = styled.span`
  color: #fb4103;
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
  color: #6d707b;
`;

const ViewAllLink = styled.button`
  border: none;
  border-bottom: 1px solid #6d707b;
  background: none;
  padding: 4px 0;
  font-size: 14px;
  color: #6d707b;
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
  background: #f6f6f6;
  border-radius: 4px;
`;

const InfoCardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const InfoCardText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 26px;
  color: #000;
`;

const UploadBox = styled.div`
  width: 100%;
  height: 300px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px dashed #6d707b;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
  color: #6d707b;
`;

const FullWidthButton = styled(Button)`
  width: 100%;
`;

export default function Home() {
  const navigate = useNavigate();
  const visibleAsItems = AS_ITEMS.slice(0, MAX_VISIBLE_AS_ITEMS);

  const handleAsDetail = (item) => {
    navigate("/my-as-detail", {
      state: { asCase: { id: item.id, productName: item.productName, status: item.status } },
    });
  };

  return (
    <Page>
      <BodyRow>
        <Body>
          <Columns>
            <LeftColumn>
              <Hero>
                <HeroTitle>CUSTODIA 케어</HeroTitle>
                <HeroDescription>
                  고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
                </HeroDescription>
                <Button variant="filled" onClick={() => navigate("/as-start")}>
                  AS 접수 시작
                </Button>
              </Hero>

              <AsListSection>
                <AsList>
                  {visibleAsItems.length === 0 ? (
                    <EmptyAsList>아직 AS 내역이 없어요</EmptyAsList>
                  ) : (
                    visibleAsItems.map((item) => (
                      <AsItem key={item.id}>
                        <AsItemInfo>
                          <AsItemName>
                            {item.productName} · {item.id}
                          </AsItemName>
                          <AsItemStatus>{renderAsItemStatus(item)}</AsItemStatus>
                        </AsItemInfo>
                        <Button variant="stroke" onClick={() => handleAsDetail(item)}>
                          상세보기
                        </Button>
                      </AsItem>
                    ))
                  )}
                </AsList>
                <ViewAllLink type="button" onClick={() => navigate("/my-as-list")}>
                  전체 접수 내역 보기
                </ViewAllLink>
              </AsListSection>
            </LeftColumn>

            <RightColumn>
              <InfoCard>
                <InfoCardTitle>AI 컨시어지 & 상담원 연결</InfoCardTitle>
                <div>
                  <InfoCardText>
                    고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
                  </InfoCardText>
                  <InfoCardText>최종 수선 판단 및 비용 확정은 실물 진단 후 상담원이 안내합니다.</InfoCardText>
                </div>
                <Button variant="filled" onClick={() => navigate("/pick-as")}>
                  기존 AS 건 상담하기
                </Button>
              </InfoCard>

              <InfoCard>
                <InfoCardTitle>사진 기반 예상 견적</InfoCardTitle>
                <UploadBox>Image</UploadBox>
                <div>
                  <InfoCardText>
                    고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
                  </InfoCardText>
                  <InfoCardText>최종 수선 판단 및 비용 확정은 실물 진단 후 상담원이 안내합니다.</InfoCardText>
                </div>
                <FullWidthButton variant="filled" onClick={() => navigate("/product-info")}>
                  예상 견적 확인하기
                </FullWidthButton>
              </InfoCard>
            </RightColumn>
          </Columns>
        </Body>
      </BodyRow>
    </Page>
  );
}
