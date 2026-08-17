import { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import chevronIcon from "../assets/icon_chevron.svg";
import stepBg from "../assets/icon_step_bg.svg";
import stepCertificate from "../assets/icon_step_certificate.svg";
import stepCamera from "../assets/icon_step_camera.svg";
import stepSchedule from "../assets/icon_step_schedule.svg";
import stepPackage from "../assets/icon_step_package.svg";
import stepConnector from "../assets/icon_step_connector.svg";

const START_CARDS = [
  {
    title: "접수 시작",
    text: "아래 버튼을 눌러 제품 정보 입력을 시작하세요.",
    buttonLabel: "AS 접수 시작하기",
    to: "/product-info",
  },
  {
    title: "예상 견적 먼저 확인하기",
    text: "접수 전에 손상 사진을 제출하면 AI가 예상 수선 비용 범위를 안내합니다.",
    buttonLabel: "AI 예상 견적 받기",
    to: "/product-info",
  },
  {
    title: "문의가 있으신가요?",
    text: "접수 절차, 비용, 소요 기간에 대한 사항은 AI 상담 또는 상담원 연결로 안내받을 수 있습니다.",
    buttonLabel: "AI 상담 시작",
    to: "/pick-as",
  },
];

const CHECKLIST_ITEMS = [
  {
    number: "01",
    icon: stepCertificate,
    label: "구매 증빙",
    desc: "구매 이력 확인에 사용됩니다. 온라인 구매는 주문번호로 대체 가능합니다.",
  },
  {
    number: "02",
    icon: stepCamera,
    label: "제품 사진",
    desc: "손상 유형 및 예상 견적 확인을 위해 선명한 사진을 준비해 주세요.",
  },
  {
    number: "03",
    icon: stepSchedule,
    label: "수거 일정",
    desc: "접수 후 픽업 예약 단계에서 날짜와 시간대를 선택합니다.",
  },
  {
    number: "04",
    icon: stepPackage,
    label: "제품 정리",
    desc: "제품 본체만 인계할 수 있도록 부속품과 개인 소지품을 미리 제거해 주세요.",
  },
];

const SCHEDULE_ITEMS = [
  { label: "접수 및 픽업 예약", value: "약 10분" },
  { label: "AI 예상 견적 안내", value: "사진 제출 후 즉시" },
  { label: "수선 소요 기간", value: "손상 유형에 따라 상이 (최소 2주)" },
  { label: "최종 견적 확정", value: "실물 진단 완료 후 안내" },
];

const SERVICE_NOTICES = [
  "CUSTODIA A/S는 정품 부자재와 공인 수선 기술을 사용합니다.",
  "예상 견적은 참고용이며, 실물 진단 후 최종 비용이 확정됩니다.",
  "수선 진행 상황은 리페어 패스포트에서 실시간으로 확인하실 수 있습니다.",
  "신원 확인된 기사가 제품을 직접 수거하며, 운송 구간 전체에 보험이 적용됩니다.",
];

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 52px 48px;
  box-sizing: border-box;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #000;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 1fr);
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
  gap: 32px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const StartCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 20px;
  padding: 32px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const StartCardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #000;
`;

const StartCardText = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 26px;
  color: #000;
`;

const SectionBlock = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const SectionHeader = styled.button`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font: inherit;
  text-align: left;
`;

const SectionHeaderTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #222;
`;

const SectionChevron = styled.img`
  width: 24px;
  height: 24px;
  transform: rotate(${(props) => (props.$open ? "-90deg" : "90deg")});
`;

const ChecklistGroup = styled.div`
  width: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0;
`;

const ChecklistItem = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const ChecklistIconWrap = styled.div`
  position: relative;
  flex-shrink: 0;
  width: 76px;
  height: 76px;
`;

const ChecklistIconBg = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
`;

const ChecklistIconGlyph = styled.img`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  height: 42px;
  width: auto;
`;

const ChecklistConnector = styled.img`
  position: absolute;
  left: 50%;
  top: 78px;
  width: 1px;
  height: 20px;
  transform: translateX(-50%);
`;

const ChecklistBody = styled.div`
  min-width: 0;
  flex: 1 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ChecklistNumber = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #222;
`;

const ChecklistLabel = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #222;
`;

const ChecklistDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 20px;
  color: #313131;
`;

const ScheduleList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const ScheduleRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 16px 8px;
  border-bottom: 1px solid #d1d5db;
  font-size: 14px;
  color: #313131;

  &:last-child {
    border-bottom: none;
  }
`;

const NoticeList = styled.ol`
  width: 100%;
  margin: 0;
  padding: 0;
  list-style: none;
  counter-reset: notice;
`;

const NoticeItem = styled.li`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 16px 4px;
  font-size: 14px;
  line-height: 14px;
  color: #313131;
  counter-increment: notice;

  &::before {
    content: counter(notice) ".";
  }
`;

const INITIAL_OPEN_SECTIONS = {
  checklist: false,
  schedule: false,
  notice: false,
};

export default function AS_Start() {
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState(INITIAL_OPEN_SECTIONS);

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Page>
      <Body>
        <PageTitle>AS 접수</PageTitle>

        <Columns>
          <LeftColumn>
            {START_CARDS.map((card) => (
              <StartCard key={card.title}>
                <StartCardTitle>{card.title}</StartCardTitle>
                <StartCardText>{card.text}</StartCardText>
                <Button type="button" variant="filled" onClick={() => navigate(card.to)}>
                  {card.buttonLabel}
                </Button>
              </StartCard>
            ))}
          </LeftColumn>

          <RightColumn>
            <SectionBlock>
              <SectionHeader
                type="button"
                aria-expanded={openSections.checklist}
                onClick={() => toggleSection("checklist")}
              >
                <SectionHeaderTitle>접수 전 확인 사항</SectionHeaderTitle>
                <SectionChevron src={chevronIcon} alt="" $open={openSections.checklist} />
              </SectionHeader>
              {openSections.checklist && (
                <ChecklistGroup>
                  {CHECKLIST_ITEMS.map((item, index) => (
                    <ChecklistItem key={item.number}>
                      <ChecklistIconWrap>
                        <ChecklistIconBg src={stepBg} alt="" />
                        <ChecklistIconGlyph src={item.icon} alt="" />
                        {index < CHECKLIST_ITEMS.length - 1 && (
                          <ChecklistConnector src={stepConnector} alt="" />
                        )}
                      </ChecklistIconWrap>
                      <ChecklistBody>
                        <ChecklistNumber>{item.number}</ChecklistNumber>
                        <ChecklistLabel>{item.label}</ChecklistLabel>
                        <ChecklistDesc>{item.desc}</ChecklistDesc>
                      </ChecklistBody>
                    </ChecklistItem>
                  ))}
                </ChecklistGroup>
              )}
            </SectionBlock>

            <SectionBlock>
              <SectionHeader
                type="button"
                aria-expanded={openSections.schedule}
                onClick={() => toggleSection("schedule")}
              >
                <SectionHeaderTitle>예상 소요 안내</SectionHeaderTitle>
                <SectionChevron src={chevronIcon} alt="" $open={openSections.schedule} />
              </SectionHeader>
              {openSections.schedule && (
                <ScheduleList>
                  {SCHEDULE_ITEMS.map((item) => (
                    <ScheduleRow key={item.label}>
                      <span>{item.label}</span>
                      <span>{item.value}</span>
                    </ScheduleRow>
                  ))}
                </ScheduleList>
              )}
            </SectionBlock>

            <SectionBlock>
              <SectionHeader
                type="button"
                aria-expanded={openSections.notice}
                onClick={() => toggleSection("notice")}
              >
                <SectionHeaderTitle>A/S 서비스 안내</SectionHeaderTitle>
                <SectionChevron src={chevronIcon} alt="" $open={openSections.notice} />
              </SectionHeader>
              {openSections.notice && (
                <NoticeList>
                  {SERVICE_NOTICES.map((notice) => (
                    <NoticeItem key={notice}>{notice}</NoticeItem>
                  ))}
                </NoticeList>
              )}
            </SectionBlock>
          </RightColumn>
        </Columns>
      </Body>
    </Page>
  );
}
