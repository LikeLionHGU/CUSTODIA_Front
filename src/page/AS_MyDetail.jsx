import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as asCaseApi from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, formatKoreanDateTime, toErrorMessage } from "../api/format";

const LOCATION_NOTICE = {
  title: "정보 미확정 안내",
  body: "수선 업체 내부 일정에 따라 세부 위치 정보가 일부 제공되지 않을 수 있습니다. 갱신 시 즉시 반영됩니다.",
};

/** 명세 3-6: completed 여부로 아이콘과 문구를 나눈다 */
function timelineIcon(step, isCurrent) {
  if (!step.completed) return "○";
  return isCurrent ? "→" : "✓";
}

function timelineDesc(step) {
  if (!step.completed) return `예정 · ${step.description}`;
  return [formatKoreanDate(step.occurredAt), step.description].filter(Boolean).join(" · ");
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

const TitleCol = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const SectionSubTitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const Spacer = styled.div`
  flex: 1 0 0;
  min-width: 0;
  height: 1px;
`;

const LinkButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  font-size: 14px;
  color: #6b7280;
  text-decoration: underline;
  cursor: pointer;
`;

const PrimaryButton = styled.button`
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

const StateText = styled.p`
  width: 100%;
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const Columns = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 24px;
`;

const LeftColumn = styled.div`
  width: 400px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const RightColumn = styled.div`
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
  gap: 12px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #1f2937;
`;

const InfoValue = styled.span`
  font-size: 12px;
  color: #1f2937;
`;

const Chip = styled.span`
  min-width: 40px;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 500;
  box-sizing: border-box;
  background: #f3f4f6;
  color: #1f2937;
  border: 1px solid #e5e7eb;
`;

const ProgressTrack = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 4px;
  background: #e5e7eb;
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 4px;
  background: #1f2937;
  width: ${(props) => props.$percent}%;
`;

const MessageCol = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const NoticeCard = styled.div`
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

const NoticeTitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const NoticeBody = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const NoticeBodySmall = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const TimelineList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const TimelineRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  /* 명세 3-6: 미완료 단계는 흐리게 표시한다 */
  opacity: ${(props) => (props.$dimmed ? 0.45 : 1)};
`;

const TimelineIcon = styled.div`
  width: 16px;
  flex-shrink: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: 12px;
  color: #1f2937;
`;

const TimelineInfo = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimelineTitle = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const TimelineDesc = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const ConsultBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConsultText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ConsultButtonRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
`;

export default function AS_MyDetail() {
  const navigate = useNavigate();
  const location = useLocation();

  const asNo = location.state?.asNo;

  const { data, loading, error } = useApiQuery(
    () => (asNo ? asCaseApi.getDetail(asNo) : Promise.reject(new Error("접수 번호가 없습니다."))),
    [asNo],
  );

  const historyList = data?.historyList ?? [];
  // 완료된 단계 중 마지막이 현재 단계다
  const currentIndex = historyList.reduce((last, step, i) => (step.completed ? i : last), -1);
  const progress = historyList.length
    ? Math.round(((currentIndex + 1) / historyList.length) * 100)
    : 0;

  const handleGoToList = () => {
    navigate("/my-as-list");
  };

  // 명세 3-6: 이 버튼은 POST /api/chat 에 asNo 를 담아 호출한다
  const handleConsult = () => {
    navigate("/ai-concierge", {
      state: {
        asNo: data?.asNo ?? asNo,
        modelName: data?.modelName,
        statusLabel: data?.statusLabel,
      },
    });
  };

  return (
    <Page>
      <BodyRow>
        <Body>
          <TitleRow>
            <TitleCol>
              <SectionTitle>리페어 패스포트 상세</SectionTitle>
              <SectionSubTitle>AS 번호 · 제품명 · 현재 상태를 확인하세요</SectionSubTitle>
            </TitleCol>
            <Spacer />
            <LinkButton type="button" onClick={handleGoToList}>
              AS 건 목록으로
            </LinkButton>
            <PrimaryButton type="button" onClick={handleConsult}>
              이 AS 건 상담하기
            </PrimaryButton>
          </TitleRow>

          {loading && <StateText>불러오는 중…</StateText>}
          {!loading && error && <StateText>{toErrorMessage(error)}</StateText>}

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>접수 건 식별 정보</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>AS 번호</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.asNo ?? asNo ?? "—"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>제품명</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.modelName ?? "—"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>접수일</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.createdAt ? formatKoreanDate(data.createdAt) : "—"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>접수 유형</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.intakeType ?? "—"}</InfoValue>
                  </InfoRow>
                </InfoRows>
              </Card>

              <Card>
                <CardTitle>현재 처리 단계</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>현재 단계</InfoLabel>
                    <Spacer />
                    <Chip>{data?.statusLabel ?? "—"}</Chip>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>최신 상태 업데이트</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.statusUpdatedAt ? formatKoreanDateTime(data.statusUpdatedAt) : "—"}</InfoValue>
                  </InfoRow>
                  <ProgressTrack>
                    <ProgressFill $percent={progress} />
                  </ProgressTrack>
                </InfoRows>
                <MessageCol>
                  <InfoLabel>최신 상태 메시지</InfoLabel>
                  <NoticeBodySmall>{data?.statusMessage ?? "—"}</NoticeBodySmall>
                </MessageCol>
              </Card>

              <Card>
                <CardTitle>예상 완료일</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>예상 완료일</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.expectedCompletedAt ? formatKoreanDate(data.expectedCompletedAt) : "—"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>최종 갱신</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.expectedUpdatedAt ? formatKoreanDate(data.expectedUpdatedAt) : "—"}</InfoValue>
                  </InfoRow>
                  <NoticeCard>
                    <NoticeTitle>일정 변동 안내</NoticeTitle>
                    <NoticeBody>{data?.delayReason ?? "현재 안내된 일정 변동 사항이 없습니다."}</NoticeBody>
                  </NoticeCard>
                </InfoRows>
              </Card>

              <Card>
                <CardTitle>위치 및 현황</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>현재 위치</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.currentLocation ?? "—"}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>위치 유형</InfoLabel>
                    <Spacer />
                    <Chip>{data?.locationType ?? "—"}</Chip>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>위치 상태</InfoLabel>
                    <Spacer />
                    <InfoValue>{data?.locationStatus ?? "—"}</InfoValue>
                  </InfoRow>
                </InfoRows>
                <MessageCol>
                  <InfoLabel>{LOCATION_NOTICE.title}</InfoLabel>
                  <NoticeBody>{LOCATION_NOTICE.body}</NoticeBody>
                </MessageCol>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>수선 진행 이력</CardTitle>
                <TimelineList>
                  {historyList.map((step, index) => (
                    <TimelineRow key={step.status} $dimmed={!step.completed}>
                      <TimelineIcon>{timelineIcon(step, index === currentIndex)}</TimelineIcon>
                      <TimelineInfo>
                        <TimelineTitle>{step.statusLabel}</TimelineTitle>
                        <TimelineDesc>{timelineDesc(step)}</TimelineDesc>
                      </TimelineInfo>
                    </TimelineRow>
                  ))}
                </TimelineList>
              </Card>

              <Card>
                <CardTitle>상담 연결 안내</CardTitle>
                <ConsultBody>
                  <ConsultText>이 AS 건에 대해 궁금한 점이 있으신가요?</ConsultText>
                  <ConsultText>
                    AI 컨시어지 또는 상담원이 접수 이력과 수선 진행 기록을 공유하여 반복 설명 없이 문의를
                    이어갑니다.
                  </ConsultText>
                  <ConsultButtonRow>
                    <PrimaryButton type="button" onClick={handleConsult}>
                      이 AS 건 상담하기
                    </PrimaryButton>
                  </ConsultButtonRow>
                </ConsultBody>
              </Card>
            </RightColumn>
          </Columns>
        </Body>
      </BodyRow>
    </Page>
  );
}
