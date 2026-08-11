import styled, { css } from "styled-components";
import { Link, useNavigate } from "react-router-dom";

const REPAIR_ITEMS = [
  {
    id: "AS-2024-00312",
    name: "MCM 클래식 백팩",
    status: "수선 진행 중 · 예상 완료 2025년 8월 4일",
  },
  {
    id: "AS-2024-00298",
    name: "MCM 스타크 지갑",
    status: "검수 완료 · 예상 완료 2025년 7월 30일",
  },
  {
    id: "AS-2024-00271",
    name: "MCM 미니 크로스백",
    status: "픽업 예약 완료 · 수거 대기 중",
  },
];

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
  align-items: flex-start;
  gap: 40px;
  padding: 24px;
  box-sizing: border-box;
`;

const Hero = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
`;

const Title = styled.p`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
`;

const Description = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  font-size: 14px;
  cursor: pointer;

  ${(props) =>
    props.$variant === "link"
      ? css`
          padding: 0;
          border: none;
          background: none;
          color: #6b7280;
          text-decoration: underline;
          font-weight: 400;
        `
      : props.$variant === "secondary"
        ? css`
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid #1f2937;
            background: #fff;
            color: #1f2937;
            font-weight: 500;
          `
        : css`
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            background: #1f2937;
            color: #fff;
            font-weight: 500;
          `}
`;

const StartButtonLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  background: #1f2937;
  color: #fff;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  align-items: start;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const CardText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const CardNote = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const RepairList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const RepairItem = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const RepairInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RepairName = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const RepairStatus = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const UploadBox = styled.div`
  width: 100%;
  height: 120px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  font-size: 11px;
  color: #9ca3af;
`;

export default function Home() {
  const navigate = useNavigate();

  return (
    <Page>
      <BodyRow>
        <Body>
          <Hero>
            <Title>MCM 케어</Title>
            <Description>
              고가 제품을 안심하고 맡기세요. 수선 접수부터 완료까지 모든 과정을 투명하게 안내합니다.
            </Description>
            <StartButtonLink to="/as-start">AS 접수 시작</StartButtonLink>
          </Hero>

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>리페어 패스포트</CardTitle>
                <CardText>접수 건별 처리 단계, 최신 상태, 예상 완료일을 한눈에 확인하세요.</CardText>
                <RepairList>
                  {REPAIR_ITEMS.map((item) => (
                    <RepairItem key={item.id}>
                      <RepairInfo>
                        <RepairName>
                          {item.name} · {item.id}
                        </RepairName>
                        <RepairStatus>{item.status}</RepairStatus>
                      </RepairInfo>
                      <Button type="button" $variant="secondary">
                        상세 보기
                      </Button>
                    </RepairItem>
                  ))}
                </RepairList>
                <Button type="button" $variant="link" onClick={() => navigate("/my-as-list")}>
                  전체 접수 내역 보기
                </Button>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>AI 컨시어지 & 상담원 연결</CardTitle>
                <CardText>
                  기존 AS 접수 건을 선택하면 이전 구매·접수·상담 이력을 공유한 채로 문의를 이어갈 수 있습니다.
                </CardText>
                <CardNote>최종 수선 판단 및 비용 확정은 실물 진단 후 상담원이 안내합니다.</CardNote>
                <Button type="button" $variant="secondary" onClick={() => navigate("/pick-as")}>
                  기존 AS 건 상담하기
                </Button>
              </Card>

              <Card>
                <CardTitle>사진 기반 예상 견적</CardTitle>
                <UploadBox>Image</UploadBox>
                <CardText>
                  제품 사진과 손상 부위 이미지를 제출하면 AI가 손상 유형을 분류하고 예상 수선 비용 범위를 안내합니다.
                </CardText>
                <CardNote>
                  이 견적은 접수 전 의사결정을 위한 참고 안내이며, 실물 진단 후 최종 견적과 다를 수 있습니다.
                </CardNote>
                <Button type="button" $variant="secondary" onClick={() => navigate("/product-info")}>
                  예상 견적 확인하기
                </Button>
              </Card>
            </RightColumn>
          </Columns>
        </Body>
      </BodyRow>
    </Page>
  );
}
