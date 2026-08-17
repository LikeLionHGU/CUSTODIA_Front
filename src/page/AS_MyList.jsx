import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as asCase from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatDotDate, toErrorMessage } from "../api/format";

// 명세 3-5: filter 는 ALL · IN_PROGRESS · COMPLETED
const FILTERS = [
  { label: "진행중", value: "IN_PROGRESS" },
  { label: "완료", value: "COMPLETED" },
  { label: "전체", value: "ALL" },
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
  const [filter, setFilter] = useState("ALL");

  const { data, loading, error } = useApiQuery(() => asCase.getList({ filter }), [filter]);
  const itemList = data?.itemList ?? [];

  const handleCaseClick = (item) => {
    navigate("/my-as-detail", { state: { asNo: item.asNo } });
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
            {FILTERS.map((item) => (
              <Chip
                key={item.value}
                type="button"
                $selected={filter === item.value}
                onClick={() => setFilter(item.value)}
              >
                {item.label}
              </Chip>
            ))}
          </TitleRow>

          <Card>
            <CardTitle>국내외 수선 현황</CardTitle>
            <SummaryGrid>
              <SummaryItem>
                <SummaryLabel>진행 중</SummaryLabel>
                <SummaryValue>{data ? `${data.inProgressCount}건` : "—"}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>완료</SummaryLabel>
                <SummaryValue>{data ? `${data.completedCount}건` : "—"}</SummaryValue>
              </SummaryItem>
              <SummaryItem>
                <SummaryLabel>최근 갱신</SummaryLabel>
                <SummaryValueSmall>
                  {data?.lastUpdatedAt ? formatDotDate(data.lastUpdatedAt) : "—"}
                </SummaryValueSmall>
              </SummaryItem>
            </SummaryGrid>
          </Card>

          <ListTitle>접수 건 목록</ListTitle>

          {itemList.map((item) => (
            <CaseCard key={item.asNo} type="button" onClick={() => handleCaseClick(item)}>
              <CaseRow>
                <CaseInfo>
                  <CaseId>{item.asNo}</CaseId>
                  <CaseName>{item.modelName}</CaseName>
                  <CaseDate>접수일 {formatDotDate(item.createdAt)}</CaseDate>
                </CaseInfo>
                <Spacer />
                <CaseStatusCol>
                  <Chip as="span" $selected={false}>
                    {item.statusLabel}
                  </Chip>
                  {/* 명세 3-5: 진행 중은 expectedCompletedAt, 완료는 completedAt */}
                  <CaseDate>
                    {item.completedAt
                      ? `완료일 ${formatDotDate(item.completedAt)}`
                      : item.expectedCompletedAt
                        ? `예상 완료 ${formatDotDate(item.expectedCompletedAt)}`
                        : ""}
                  </CaseDate>
                  <CaseDate>최근 갱신 {formatDotDate(item.statusUpdatedAt)}</CaseDate>
                </CaseStatusCol>
              </CaseRow>
            </CaseCard>
          ))}

          {loading && <EmptyCard><EmptyText>불러오는 중…</EmptyText></EmptyCard>}

          {!loading && error && (
            <EmptyCard>
              <EmptyText>{toErrorMessage(error)}</EmptyText>
            </EmptyCard>
          )}

          {!loading && !error && itemList.length === 0 && (
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
