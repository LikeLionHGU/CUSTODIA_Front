import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

const AS_CASES = [
  {
    id: "AS-2025-00341",
    productName: "MCM 클래식 백팩 (블랙)",
    receivedDate: "2025.06.02",
    status: "수선 중",
    group: "진행중",
    expectedLabel: "예상 완료",
    expectedDate: "2025.07.20",
    updatedDate: "2025.07.14",
  },
  {
    id: "AS-2025-00287",
    productName: "MCM 스타크 숄더백 (코냑)",
    receivedDate: "2025.05.18",
    status: "검수 중",
    group: "진행중",
    expectedLabel: "예상 완료",
    expectedDate: "2025.07.16",
    updatedDate: "2025.07.13",
  },
  {
    id: "AS-2025-00194",
    productName: "MCM 비세토스 토트백 (베이지)",
    receivedDate: "2025.04.07",
    status: "접수 완료",
    group: "진행중",
    expectedLabel: "예상 완료",
    expectedDate: "2025.08.01",
    updatedDate: "2025.07.10",
  },
  {
    id: "AS-2024-01823",
    productName: "MCM 로엔 카메라백 (실버)",
    receivedDate: "2024.11.22",
    status: "완료",
    group: "완료",
    expectedLabel: "완료일",
    expectedDate: "2025.01.08",
    updatedDate: "2025.01.08",
  },
  {
    id: "AS-2024-01540",
    productName: "MCM 클래식 지갑 (레드)",
    receivedDate: "2024.09.03",
    status: "완료",
    group: "완료",
    expectedLabel: "완료일",
    expectedDate: "2024.10.15",
    updatedDate: "2024.10.15",
  },
];

const FILTERS = ["진행중", "완료", "전체"];

const SUMMARY = {
  inProgressCount: "3건",
  completedCount: "12건",
  lastUpdated: "2025.07.14",
};

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

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const Spacer = styled.div`
  flex: 1 0 0;
  min-width: 0;
  height: 1px;
`;

const Chip = styled.button`
  min-width: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  box-sizing: border-box;
  background: ${(props) => (props.$selected ? "#1f2937" : "#f3f4f6")};
  color: ${(props) => (props.$selected ? "#fff" : "#1f2937")};
  border: 1px solid #e5e7eb;
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

const SummaryGrid = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
`;

const SummaryItem = styled.div`
  flex: 1 0 0;
  min-width: 80px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const SummaryLabel = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const SummaryValue = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const SummaryValueSmall = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ListTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const CaseCard = styled.button`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  text-align: left;
  font: inherit;
`;

const CaseRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const CaseInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CaseId = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const CaseName = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const CaseDate = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const CaseStatusCol = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
`;

const EmptyCard = styled(Card)`
  align-items: center;
  text-align: center;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const EmptyNote = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
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

export default function AS_MyList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("전체");

  const filteredCases = useMemo(() => {
    if (filter === "전체") return AS_CASES;
    return AS_CASES.filter((item) => item.group === filter);
  }, [filter]);

  const handleCaseClick = (asCase) => {
    navigate("/my-as-detail", { state: { asCase } });
  };

  const handleAsStart = () => {
    navigate("/as-start");
  };

  return (
    <Page>
      <BodyRow>
        <Body>
          <TitleRow>
            <SectionTitle>리페어 패스포트</SectionTitle>
            <Spacer />
            {FILTERS.map((label) => (
              <Chip key={label} type="button" $selected={filter === label} onClick={() => setFilter(label)}>
                {label}
              </Chip>
            ))}
          </TitleRow>

          <Card>
            <CardTitle>국내외 수선 현황</CardTitle>
            <SummaryGrid>
              <SummaryItem>
                <SummaryLabel>진행 중</SummaryLabel>
                <SummaryValue>{SUMMARY.inProgressCount}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>완료</SummaryLabel>
                <SummaryValue>{SUMMARY.completedCount}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>최근 갱신</SummaryLabel>
                <SummaryValueSmall>{SUMMARY.lastUpdated}</SummaryValueSmall>
              </SummaryItem>
            </SummaryGrid>
          </Card>

          <ListTitle>접수 건 목록</ListTitle>

          {filteredCases.map((item) => (
            <CaseCard key={item.id} type="button" onClick={() => handleCaseClick(item)}>
              <CaseRow>
                <CaseInfo>
                  <CaseId>{item.id}</CaseId>
                  <CaseName>{item.productName}</CaseName>
                  <CaseDate>접수일 {item.receivedDate}</CaseDate>
                </CaseInfo>
                <Spacer />
                <CaseStatusCol>
                  <Chip as="span" $selected={false}>
                    {item.status}
                  </Chip>
                  <CaseDate>
                    {item.expectedLabel} {item.expectedDate}
                  </CaseDate>
                  <CaseDate>최근 갱신 {item.updatedDate}</CaseDate>
                </CaseStatusCol>
              </CaseRow>
            </CaseCard>
          ))}

          {filteredCases.length === 0 && (
            <EmptyCard>
              <EmptyText>접수 건이 없습니다</EmptyText>
              <EmptyNote>AS 접수를 완료하면 리페어 패스포트에서 진행 상황을 실시간으로 확인하실 수 있습니다.</EmptyNote>
              <Button type="button" onClick={handleAsStart}>
                AS 접수하기
              </Button>
            </EmptyCard>
          )}
        </Body>
      </BodyRow>
    </Page>
  );
}
