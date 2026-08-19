import { useEffect } from "react";
import styled from "styled-components";

import closeIcon from "../assets/icon_close.svg";
import stepBg from "../assets/icon_step_bg.svg";
import stepConnector from "../assets/icon_step_connector.svg";
import { CHECKLIST_ITEMS, SCHEDULE_ITEMS, SERVICE_NOTICES } from "../data/asGuide";
import { useT } from "../i18n";

export default function AsGuideModal({ open, onClose }) {
  const t = useT();
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <Overlay onClick={onClose}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="as-guide-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <TitleRow>
          <DialogTitle id="as-guide-modal-title">{t("A/S접수 안내")}</DialogTitle>
          <CloseButton type="button" onClick={onClose} aria-label={t("닫기")}>
            <CloseIcon src={closeIcon} alt="" />
          </CloseButton>
        </TitleRow>

        <Sections>
          <Section>
            <SectionHeader>{t("접수 전 확인 사항")}</SectionHeader>
            <ChecklistGroup>
              {CHECKLIST_ITEMS.map((item, index) => (
                <ChecklistItem key={item.number}>
                  <ChecklistIconWrap>
                    <ChecklistIconBg src={stepBg} alt="" />
                    <ChecklistIconGlyph
                      src={item.icon}
                      alt=""
                      $width={item.iconSize.width}
                      $height={item.iconSize.height}
                    />
                    {index < CHECKLIST_ITEMS.length - 1 && (
                      <ChecklistConnector src={stepConnector} alt="" />
                    )}
                  </ChecklistIconWrap>
                  <ChecklistBody>
                    <ChecklistNumber>{item.number}</ChecklistNumber>
                    <ChecklistLabel>{t(item.label)}</ChecklistLabel>
                    <ChecklistDesc>{t(item.desc)}</ChecklistDesc>
                  </ChecklistBody>
                </ChecklistItem>
              ))}
            </ChecklistGroup>
          </Section>

          <Section>
            <SectionHeader>{t("예상 소요 시간 안내")}</SectionHeader>
            <ScheduleList>
              {SCHEDULE_ITEMS.map((item) => (
                <ScheduleRow key={item.label}>
                  <span>{t(item.label)}</span>
                  <span>{t(item.value)}</span>
                </ScheduleRow>
              ))}
            </ScheduleList>
          </Section>

          <Section>
            <SectionHeader>{t("A/S 서비스 안내")}</SectionHeader>
            <NoticeList>
              {SERVICE_NOTICES.map((notice) => (
                <NoticeItem key={notice}>{t(notice)}</NoticeItem>
              ))}
            </NoticeList>
          </Section>
        </Sections>
      </Dialog>
    </Overlay>
  );
}

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  box-sizing: border-box;
  background: rgba(34, 34, 34, 0.8);
  backdrop-filter: blur(1.5px);
`;

const Dialog = styled.div`
  /* 디자인 기준 콘텐츠 폭 481px + 좌우 패딩 32px */
  width: min(545px, 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  max-height: 100%;
  padding: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  text-align: left;
`;

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const DialogTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CloseButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
`;

const CloseIcon = styled.img`
  width: 14px;
  height: 14px;
`;

const Sections = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Section = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.p`
  width: 100%;
  margin: 0;
  padding: 8px 12px;
  box-sizing: border-box;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const ChecklistGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 12px 0;
  box-sizing: border-box;
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
  width: 60.8px;
  height: 60.8px;
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
  width: ${(props) => props.$width}px;
  height: ${(props) => props.$height}px;
`;

const ChecklistConnector = styled.img`
  position: absolute;
  left: 50%;
  top: 62px;
  width: 1px;
  height: 18px;
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
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 1px;
  color: #222;
`;

const ChecklistLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
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
  padding: 12px 8px;
  border-bottom: 1px solid #d1d5db;
  font-size: 12px;
  line-height: 12px;
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
  gap: 6px;
  align-items: flex-start;
  padding: 8px 4px;
  font-size: 12px;
  line-height: 20px;
  color: #313131;
  counter-increment: notice;

  &::before {
    flex-shrink: 0;
    content: counter(notice) ".";
  }
`;
