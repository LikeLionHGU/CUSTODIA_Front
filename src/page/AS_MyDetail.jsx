import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const DEFAULT_CASE = {
  id: "MCM-2024-009341",
  productName: "MCM 백팩 스몰 코냑",
  receivedDate: "2024년 11월 12일",
  receiveType: "픽업 수거 접수",
};

const CURRENT_STAGE = {
  stage: "수선 진행 중",
  updatedAt: "2024년 11월 20일 14:32",
  progress: 65,
  message: "지퍼 교체 및 내부 라이닝 수선 작업이 진행 중입니다.",
};

const COMPLETION = {
  expectedDate: "2024년 12월 3일",
  lastUpdated: "2024년 11월 20일",
  noticeTitle: "일정 변동 안내",
  noticeBody: "수선 부품 수급으로 인해 완료 예정일이 3일 조정되었습니다. 확정 후 즉시 알림을 발송합니다.",
};

const LOCATION_INFO = {
  place: "MCM 서울 수선 센터",
  type: "국내",
  status: "수선 작업 중",
  noticeTitle: "정보 미확정 안내",
  noticeBody: "수선 업체 내부 일정에 따라 세부 위치 정보가 일부 제공되지 않을 수 있습니다. 갱신 시 즉시 반영됩니다.",
};

const TIMELINE = [
  { icon: "✓", title: "접수 완료", desc: "2024년 11월 12일 · 픽업 예약 후 제품 수거 완료" },
  { icon: "✓", title: "상태 검수", desc: "2024년 11월 14일 · 제품 상태 및 손상 부위 사진 기록 완료" },
  { icon: "✓", title: "진단 및 견적 확정", desc: "2024년 11월 15일 · 지퍼 교체 및 내부 라이닝 부분 수선 확정" },
  { icon: "→", title: "수선 진행 중", desc: "2024년 11월 18일 ~ 현재 · MCM 서울 수선 센터에서 작업 중" },
  { icon: "○", title: "품질 검수", desc: "예정 · 수선 완료 후 품질 기준 최종 점검" },
  { icon: "○", title: "반환 배송", desc: "예정 · 검수 완료 후 고객 배송 진행" },
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

  const asCase = location.state?.asCase;

  const caseInfo = {
    id: asCase?.id || DEFAULT_CASE.id,
    productName: asCase?.productName || DEFAULT_CASE.productName,
    receivedDate: asCase?.receivedDate || DEFAULT_CASE.receivedDate,
    receiveType: asCase?.receiveType || DEFAULT_CASE.receiveType,
    stage: asCase?.status || CURRENT_STAGE.stage,
  };

  const handleGoToList = () => {
    navigate("/my-as-list");
  };

  const handleConsult = () => {
    navigate("/ai-concierge", { state: { asCase: caseInfo } });
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

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>접수 건 식별 정보</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>AS 번호</InfoLabel>
                    <Spacer />
                    <InfoValue>{caseInfo.id}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>제품명</InfoLabel>
                    <Spacer />
                    <InfoValue>{caseInfo.productName}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>접수일</InfoLabel>
                    <Spacer />
                    <InfoValue>{caseInfo.receivedDate}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>접수 유형</InfoLabel>
                    <Spacer />
                    <InfoValue>{caseInfo.receiveType}</InfoValue>
                  </InfoRow>
                </InfoRows>
              </Card>

              <Card>
                <CardTitle>현재 처리 단계</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>현재 단계</InfoLabel>
                    <Spacer />
                    <Chip>{caseInfo.stage}</Chip>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>최신 상태 업데이트</InfoLabel>
                    <Spacer />
                    <InfoValue>{CURRENT_STAGE.updatedAt}</InfoValue>
                  </InfoRow>
                  <ProgressTrack>
                    <ProgressFill $percent={CURRENT_STAGE.progress} />
                  </ProgressTrack>
                </InfoRows>
                <MessageCol>
                  <InfoLabel>최신 상태 메시지</InfoLabel>
                  <NoticeBodySmall>{CURRENT_STAGE.message}</NoticeBodySmall>
                </MessageCol>
              </Card>

              <Card>
                <CardTitle>예상 완료일</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>예상 완료일</InfoLabel>
                    <Spacer />
                    <InfoValue>{COMPLETION.expectedDate}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>최종 갱신</InfoLabel>
                    <Spacer />
                    <InfoValue>{COMPLETION.lastUpdated}</InfoValue>
                  </InfoRow>
                  <NoticeCard>
                    <NoticeTitle>{COMPLETION.noticeTitle}</NoticeTitle>
                    <NoticeBody>{COMPLETION.noticeBody}</NoticeBody>
                  </NoticeCard>
                </InfoRows>
              </Card>

              <Card>
                <CardTitle>위치 및 현황</CardTitle>
                <InfoRows>
                  <InfoRow>
                    <InfoLabel>현재 위치</InfoLabel>
                    <Spacer />
                    <InfoValue>{LOCATION_INFO.place}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>위치 유형</InfoLabel>
                    <Spacer />
                    <Chip>{LOCATION_INFO.type}</Chip>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>위치 상태</InfoLabel>
                    <Spacer />
                    <InfoValue>{LOCATION_INFO.status}</InfoValue>
                  </InfoRow>
                </InfoRows>
                <MessageCol>
                  <InfoLabel>{LOCATION_INFO.noticeTitle}</InfoLabel>
                  <NoticeBody>{LOCATION_INFO.noticeBody}</NoticeBody>
                </MessageCol>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>수선 진행 이력</CardTitle>
                <TimelineList>
                  {TIMELINE.map((step) => (
                    <TimelineRow key={step.title}>
                      <TimelineIcon>{step.icon}</TimelineIcon>
                      <TimelineInfo>
                        <TimelineTitle>{step.title}</TimelineTitle>
                        <TimelineDesc>{step.desc}</TimelineDesc>
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
