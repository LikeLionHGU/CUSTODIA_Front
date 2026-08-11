import styled from "styled-components";

const CHECKLIST_ITEMS = [
  {
    number: "01",
    label: "구매 영수증 또는 정품 보증서",
    desc: "접수 시 구매 이력 확인에 사용됩니다. 온라인 구매 고객은 주문번호로 대체 가능합니다.",
  },
  {
    number: "02",
    label: "제품 사진 준비 (손상 부위 포함)",
    desc: "손상 유형 분류와 예상 견적 안내에 활용됩니다. 선명한 사진을 준비해 주세요.",
  },
  {
    number: "03",
    label: "수거 주소 및 픽업 가능 일정 확인",
    desc: "접수 후 픽업 예약 단계에서 날짜와 시간대를 선택합니다.",
  },
  {
    number: "04",
    label: "부속품 분리 및 개인 소지품 제거",
    desc: "제품 본체만 인계해 주세요. 분실 방지를 위해 내부 소지품을 미리 꺼내 주시기 바랍니다.",
  },
];

const SCHEDULE_ITEMS = [
  { label: "접수 및 픽업 예약", value: "약 10분" },
  { label: "AI 예상 견적 안내", value: "사진 제출 후 즉시" },
  { label: "수선 소요 기간", value: "손상 유형에 따라 상이 (최소 2주)" },
  { label: "최종 견적 확정", value: "실물 진단 완료 후 안내" },
];

const SERVICE_NOTICES = [
  "MCM 케어 AS는 정품 부자재와 공인 수선 기술을 사용합니다.",
  "예상 견적은 참고용이며, 실물 진단 후 최종 비용이 확정됩니다.",
  "수선 진행 상황은 리페어 패스포트에서 실시간으로 확인하실 수 있습니다.",
  "신원 확인된 기사가 제품을 직접 수거하며, 운송 구간 전체에 보험이 적용됩니다.",
];

const NAV_ITEMS = ["AI 견적", "AS 접수", "나의 AS", "AI 상담"];

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

const Header = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 24px;
  box-sizing: border-box;
  background: #fff;
  border-bottom: 1px solid #d0d0d0;
`;

const Logo = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
`;

const Spacer = styled.div`
  flex: 1 0 0;
`;

const NavLink = styled.a`
  font-size: 14px;
  color: #6b7280;
  text-decoration: underline;
  white-space: nowrap;
  cursor: pointer;
`;

const Avatar = styled.div`
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  border-radius: 999px;
  background: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarLabel = styled.span`
  font-size: 11px;
  color: #fff;
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
  gap: 20px;
`;

const RightColumn = styled.div`
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

const CardText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ChecklistGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ChecklistItem = styled.div`
  width: 100%;
  display: flex;
  gap: 12px;
`;

const ChecklistNumber = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ChecklistBody = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ChecklistLabel = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const ChecklistDesc = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const ScheduleList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ScheduleRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  font-size: 12px;
  color: #1f2937;
`;

const NoticeList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Button = styled.button`
  min-width: 60px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid #1f2937;
  background: ${(props) => (props.$variant === "secondary" ? "#fff" : "#1f2937")};
  color: ${(props) => (props.$variant === "secondary" ? "#1f2937" : "#fff")};
`;

export default function AsStartPage() {
  return (
    <Page>
      <Header>
        <Logo>MCM 케어</Logo>
        <Spacer />
        {NAV_ITEMS.map((item) => (
          <NavLink key={item}>{item}</NavLink>
        ))}
        <Avatar>
          <AvatarLabel>Aa</AvatarLabel>
        </Avatar>
      </Header>

      <BodyRow>
        <Body>
          <SectionTitle>AS 접수</SectionTitle>

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>접수 전 확인 사항</CardTitle>
                <ChecklistGroup>
                  {CHECKLIST_ITEMS.map((item) => (
                    <ChecklistItem key={item.number}>
                      <ChecklistNumber>{item.number}</ChecklistNumber>
                      <ChecklistBody>
                        <ChecklistLabel>{item.label}</ChecklistLabel>
                        <ChecklistDesc>{item.desc}</ChecklistDesc>
                      </ChecklistBody>
                    </ChecklistItem>
                  ))}
                </ChecklistGroup>
              </Card>

              <Card>
                <CardTitle>예상 소요 안내</CardTitle>
                <ScheduleList>
                  {SCHEDULE_ITEMS.map((item) => (
                    <ScheduleRow key={item.label}>
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </ScheduleRow>
                  ))}
                </ScheduleList>
              </Card>

              <Card>
                <CardTitle>AS 서비스 안내</CardTitle>
                <NoticeList>
                  {SERVICE_NOTICES.map((notice) => (
                    <CardText key={notice}>{notice}</CardText>
                  ))}
                </NoticeList>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>접수 시작</CardTitle>
                <CardText>
                  아래 버튼을 눌러 제품 정보 입력을 시작하세요. 제품명, 구매일, 손상 부위 사진을 순서대로 입력합니다.
                </CardText>
                <Button type="button">AS 접수 시작하기</Button>
              </Card>

              <Card>
                <CardTitle>예상 견적 먼저 확인하기</CardTitle>
                <CardText>
                  접수 전에 손상 사진을 제출하면 AI가 예상 수선 비용 범위를 안내합니다. 접수 여부와 무관하게 이용 가능합니다.
                </CardText>
                <Button type="button" $variant="secondary">
                  AI 예상 견적 받기
                </Button>
              </Card>

              <Card>
                <CardTitle>문의가 있으신가요?</CardTitle>
                <CardText>
                  접수 절차, 비용, 소요 기간에 대한 궁금한 사항은 AI 상담 또는 상담원 연결로 안내받을 수 있습니다.
                </CardText>
                <Button type="button" $variant="secondary">
                  AI 상담 시작
                </Button>
              </Card>
            </RightColumn>
          </Columns>
        </Body>
      </BodyRow>
    </Page>
  );
}
