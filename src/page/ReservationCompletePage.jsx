import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const PREP_ITEMS = [
  "제품을 원래 포장재 또는 완충재로 감싸 준비해 주세요.",
  "기사 도착 시 신분증을 확인하실 수 있습니다.",
  "인계 직후 제품 상태 사진 촬영과 전자서명이 진행됩니다.",
  "픽업 당일 방문 전 문자 알림이 발송됩니다.",
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
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
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

const CardSubText = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const InfoRows = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #1f2937;
`;

const InfoLabel = styled.span`
  color: #1f2937;
`;

const InfoValue = styled.span`
  color: #1f2937;
  text-align: right;
`;

const PrepList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PrepItem = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
`;

const Button = styled.button`
  min-width: 60px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #1f2937;
  color: #fff;
`;

export default function ReservationCompletePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    reservationNumber = "PKP-2024-000847",
    productName,
    pickupSchedule = "2024년 6월 18일 (화) 오전 10:00 – 12:00",
    address = "서울특별시 강남구 테헤란로 123, 4층 사무실",
  } = location.state || {};

  return (
    <Page>
      <BodyRow>
        <Body>
          <SectionTitle>픽업 예약 완료</SectionTitle>

          <Card>
            <CardTitle>예약이 확정되었습니다</CardTitle>
            <CardText>
              신원 확인된 기사가 지정하신 일정에 방문합니다. 방문 전 제품을 준비해 두시면 인계가 원활하게
              진행됩니다.
            </CardText>
          </Card>

          <Card>
            <CardTitle>예약 정보</CardTitle>
            <InfoRows>
              <InfoRow>
                <InfoLabel>예약 번호</InfoLabel>
                <InfoValue>{reservationNumber}</InfoValue>
              </InfoRow>
              {productName && (
                <InfoRow>
                  <InfoLabel>제품명</InfoLabel>
                  <InfoValue>{productName}</InfoValue>
                </InfoRow>
              )}
              <InfoRow>
                <InfoLabel>픽업 일정</InfoLabel>
                <InfoValue>{pickupSchedule}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>수거 장소</InfoLabel>
                <InfoValue>{address}</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>담당 기사</InfoLabel>
                <InfoValue>신원 확인 완료 · 배차 전</InfoValue>
              </InfoRow>
            </InfoRows>
          </Card>

          <Card>
            <CardTitle>운송 보험 안내</CardTitle>
            <InfoRows>
              <InfoRow>
                <InfoLabel>보험 적용</InfoLabel>
                <InfoValue>적용됨</InfoValue>
              </InfoRow>
              <InfoRow>
                <InfoLabel>보상 한도</InfoLabel>
                <InfoValue>최대 500만 원</InfoValue>
              </InfoRow>
              <CardSubText>
                운송 중 발생하는 분실·파손에 대해 보험이 적용됩니다. 인계 전후 제품 상태 사진과 전자서명이 기록되어
                분쟁 발생 시 참고 자료로 활용됩니다.
              </CardSubText>
            </InfoRows>
          </Card>

          <Card>
            <CardTitle>기사 방문 전 준비 사항</CardTitle>
            <PrepList>
              {PREP_ITEMS.map((item) => (
                <PrepItem key={item}>· {item}</PrepItem>
              ))}
            </PrepList>
          </Card>

          <ButtonRow>
            <Button type="button" onClick={() => navigate("/my-as-list")}>
              확인
            </Button>
          </ButtonRow>
        </Body>
      </BodyRow>
    </Page>
  );
}
