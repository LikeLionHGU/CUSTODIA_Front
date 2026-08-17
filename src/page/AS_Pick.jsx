import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import * as consultation from "../api/consultation";
import { useApiQuery } from "../api/useApiQuery";
import { formatDotDate, toErrorMessage } from "../api/format";

// 디자인의 상태 pill 색상. SelectResDto 는 statusLabel(문자열)만 주고 status 코드가 없어
// 현재는 전부 기본 톤으로 표시한다. (명세 부록 F #6 — 기획 확인 필요)
const STATUS_TONES = {
  progress: { background: "#ededed", color: "#222" },
  success: { background: "#e5f3ea", color: "#4b7c5a" },
  done: { background: "#f0f0f0", color: "#c4c4c4" },
};

export default function AS_Pick() {
  const navigate = useNavigate();

  const { data, loading, error } = useApiQuery(() => consultation.getSelectList(), []);
  const itemList = data?.itemList ?? [];

  // 명세 6-1: 목록이 비면 "AS 이력이 없어요" 경로로 이동한다
  useEffect(() => {
    if (!loading && !error && data && itemList.length === 0) {
      navigate("/no-record", { replace: true });
    }
  }, [loading, error, data, itemList.length, navigate]);

  const handleConsult = (item) => {
    navigate("/ai-concierge", { state: { asNo: item.asNo } });
  };

  return (
    <Page>
      <Body>
        <Heading>
          <PageTitle>상담할 AS 접수 건 선택</PageTitle>
          <PageDescription>
            선택한 접수 건의 제품·접수·상담 이력을 바탕으로 상담이 이어집니다.
          </PageDescription>
        </Heading>

        <CaseList>
          {loading && (
            <EmptyCard>
              <EmptyText>불러오는 중…</EmptyText>
            </EmptyCard>
          )}

          {!loading && error && (
            <EmptyCard>
              <EmptyText>{toErrorMessage(error)}</EmptyText>
            </EmptyCard>
          )}

          {itemList.map((item) => (
            <CaseCard key={item.asNo}>
              <CaseInfo>
                {/* SelectResDto 에 제품 사진 필드가 없어 자리만 유지한다 */}
                <CaseThumb />
                <CaseTexts>
                  <CaseNameRow>
                    <CaseName>{item.modelName}</CaseName>
                  </CaseNameRow>
                  <CaseMetaRow>
                    <CaseId>{item.asNo}</CaseId>
                    <StatusPill $tone="progress">
                      <StatusDot $tone="progress" />
                      {item.statusLabel}
                    </StatusPill>
                  </CaseMetaRow>
                  <CaseDate>접수일 {formatDotDate(item.createdAt)}</CaseDate>
                </CaseTexts>
              </CaseInfo>
              <Button type="button" onClick={() => handleConsult(item)}>
                이 건으로 상담
              </Button>
            </CaseCard>
          ))}

          <EmptyCard>
            <EmptyText>접수 건 없이 신규 상담을 시작하시겠습니까?</EmptyText>
            <EmptyLink type="button" onClick={() => navigate("/no-record")}>
              AS 이력이 없어요
            </EmptyLink>
          </EmptyCard>
        </CaseList>
      </Body>
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
  max-width: 894px;
  margin: 0 auto;
  padding: 52px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const PageDescription = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 16px;
  color: #222;
`;

const CaseList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CaseCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const CaseInfo = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CaseThumb = styled.div`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  background: #ededed;
  border-radius: 4px;
`;

const CaseTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const CaseNameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const CaseName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CaseMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const CaseId = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

const StatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  background: ${(props) => STATUS_TONES[props.$tone].background};
  color: ${(props) => STATUS_TONES[props.$tone].color};
`;

const StatusDot = styled.span`
  flex-shrink: 0;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: ${(props) => STATUS_TONES[props.$tone].color};
`;

const CaseDate = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

const EmptyCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 19.5px;
  color: #919191;
`;

const EmptyLink = styled.button`
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
