import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const DEFAULT_SUBMISSION = {
  productName: "MCM 클래식 백팩 미디엄",
  receiptNumber: "MCM-2024-008821",
  damagePart: "핸들 및 스트랩 연결부",
};

const DAMAGE_ANALYSIS_ROWS = [
  { label: "분류된 손상 유형", value: "하드웨어 마모 및 가죽 스티칭 분리" },
  { label: "손상 정도", value: "중간 — 부분 수선 가능 수준" },
  { label: "분석 신뢰도", value: "높음 (제출 사진 3장 기반)" },
];

const COST_ITEMS = [
  { label: "하드웨어 교체", value: "₩ 80,000 – ₩ 120,000" },
  { label: "스티칭 수선", value: "₩ 40,000 – ₩ 70,000" },
];

const COST_TOTAL = { label: "예상 합계", value: "₩ 120,000 – ₩ 190,000" };

const COST_NOTES = [
  "수선 비용은 실제 손상 범위, 부품 수급 상황, 수선 난이도에 따라 변동될 수 있습니다.",
  "최종 견적은 수선 센터 입고 후 실물 진단을 거쳐 별도로 안내드립니다.",
];

const WARRANTY_ROWS = [
  { label: "구매일", value: "2023년 04월 15일" },
  { label: "보증 기간", value: "2년 (제조 결함 한정)" },
  { label: "보증 적용 검토 결과", value: "부분 보증 적용 가능성 있음" },
];

const WARRANTY_NOTES = [
  "하드웨어 마모는 정상 사용에 따른 소모로 분류될 경우 보증 적용이 제한될 수 있습니다.",
  "스티칭 분리가 제조 결함으로 확인되면 해당 항목에 한해 무상 수선이 적용될 수 있습니다.",
  "보증 적용 여부는 입고 후 담당 수선 전문가의 실물 진단에서 최종 확정됩니다.",
];

const FINAL_NOTES = [
  "이 결과는 AI가 사진을 분석한 참고용 예상 견적입니다.",
  "실물 진단 후 수선 센터에서 안내하는 최종 견적이 이 금액과 다를 수 있으며, 최종 견적 확인 후 수선 진행 여부를 결정하실 수 있습니다.",
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

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const BottomColumns = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const Column = styled.div`
  flex: 1 0 260px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

const CardSubTitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const CardNote = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const PhotoGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
`;

const PhotoSlot = styled.div`
  width: 100%;
  height: 96px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  overflow: hidden;
  font-size: 11px;
  color: #9ca3af;
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const SummaryGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
`;

const SummaryItem = styled.div`
  flex: 1 0 120px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const SummaryLabel = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const SummaryValue = styled.p`
  margin: 0;
  font-size: 12px;
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
  gap: 8px;
`;

const InfoLabel = styled.span`
  font-size: 11px;
  color: #1f2937;
`;

const InfoValue = styled.span`
  font-size: 12px;
  color: #1f2937;
`;

const CostRows = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const CostRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
  color: #1f2937;

  ${(props) => props.$bold && "font-weight: 700;"}
`;

const NoteList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const BottomRow = styled.div`
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

export default function AiEstimatePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const photos = location.state?.photos || [];
  const formData = location.state?.formData;

  const submission = {
    productName: formData?.modelName || DEFAULT_SUBMISSION.productName,
    receiptNumber: formData?.warrantyNumber || DEFAULT_SUBMISSION.receiptNumber,
    damagePart: formData?.damagePart || DEFAULT_SUBMISSION.damagePart,
  };

  const handlePickupReservation = () => {
    navigate("/pickup-reservation", {
      state: {
        receiptInfo: {
          productName: submission.productName,
          receiptNumber: submission.receiptNumber,
          status: "견적 안내 완료",
        },
      },
    });
  };

  return (
    <Page>
      <BodyRow>
        <Body>
          <SectionTitle>AI 예상 견적 결과</SectionTitle>

          <TopRow>
            <Column>
              <Card>
                <CardSubTitle>제출 정보 요약</CardSubTitle>
                <PhotoGrid>
                  {[0, 1, 2].map((idx) =>
                    photos[idx] ? (
                      <PhotoSlot key={photos[idx].id}>
                        <PhotoImg src={photos[idx].url} alt="제출 사진" />
                      </PhotoSlot>
                    ) : (
                      <PhotoSlot key={idx}>Image</PhotoSlot>
                    ),
                  )}
                </PhotoGrid>
                <SummaryGrid>
                  <SummaryItem>
                    <SummaryLabel>제품명</SummaryLabel>
                    <SummaryValue>{submission.productName}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>접수 번호</SummaryLabel>
                    <SummaryValue>{submission.receiptNumber}</SummaryValue>
                  </SummaryItem>
                  <SummaryItem>
                    <SummaryLabel>손상 부위</SummaryLabel>
                    <SummaryValue>{submission.damagePart}</SummaryValue>
                  </SummaryItem>
                </SummaryGrid>
              </Card>
            </Column>

            <Column>
              <Card>
                <CardSubTitle>AI 손상 유형 분석</CardSubTitle>
                <InfoRows>
                  {DAMAGE_ANALYSIS_ROWS.map((row) => (
                    <InfoRow key={row.label}>
                      <InfoLabel>{row.label}</InfoLabel>
                      <InfoValue>{row.value}</InfoValue>
                    </InfoRow>
                  ))}
                </InfoRows>
              </Card>
            </Column>
          </TopRow>

          <BottomColumns>
            <Column>
              <Card>
                <CardTitle>예상 수선 비용 범위</CardTitle>
                <CostRows>
                  {COST_ITEMS.map((item) => (
                    <CostRow key={item.label}>
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </CostRow>
                  ))}
                  <CostRow $bold>
                    <span>{COST_TOTAL.label}</span>
                    <span>{COST_TOTAL.value}</span>
                  </CostRow>
                </CostRows>
                <CardNote>
                  위 금액은 제출하신 사진을 기반으로 한 참고용 범위입니다. 실물 진단 결과에 따라 달라질 수
                  있습니다.
                </CardNote>
              </Card>

              <Card>
                <CardSubTitle>비용 산정 참고 안내</CardSubTitle>
                <NoteList>
                  {COST_NOTES.map((note) => (
                    <CardNote key={note}>{note}</CardNote>
                  ))}
                </NoteList>
              </Card>
            </Column>

            <Column>
              <Card>
                <CardTitle>보증 적용 가능 여부</CardTitle>
                <InfoRows>
                  {WARRANTY_ROWS.map((row) => (
                    <InfoRow key={row.label}>
                      <InfoLabel>{row.label}</InfoLabel>
                      <InfoValue>{row.value}</InfoValue>
                    </InfoRow>
                  ))}
                </InfoRows>
                {WARRANTY_NOTES.map((note) => (
                  <CardNote key={note}>{note}</CardNote>
                ))}
              </Card>

              <Card>
                <CardSubTitle>최종 견적 안내</CardSubTitle>
                {FINAL_NOTES.map((note) => (
                  <CardNote key={note}>{note}</CardNote>
                ))}
              </Card>
            </Column>
          </BottomColumns>

          <BottomRow>
            <Button type="button" onClick={handlePickupReservation}>
              픽업 예약하기
            </Button>
          </BottomRow>
        </Body>
      </BodyRow>
    </Page>
  );
}
