import { useEffect } from "react";
import styled from "styled-components";
import closeIcon from "../assets/icon_close.svg";

const CONTACTS = [
  { label: "고객 상담 대표번호", number: "1588-0000", hours: "평일 09:00 – 18:00" },
  { label: "AS 전담 직통번호", number: "1588-0001", hours: "평일 09:00 – 18:00 · 토 10:00 – 15:00" },
];

export default function AgentContactModal({ open, onClose }) {
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
        aria-labelledby="agent-contact-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <TitleRow>
          <DialogTitle id="agent-contact-modal-title">상담원 연결</DialogTitle>
          <CloseButton type="button" onClick={onClose} aria-label="닫기">
            <CloseIcon src={closeIcon} alt="" />
          </CloseButton>
        </TitleRow>

        <ContactList>
          {CONTACTS.map((contact) => (
            <ContactCard key={contact.number}>
              <ContactLabel>{contact.label}</ContactLabel>
              <ContactNumber>{contact.number}</ContactNumber>
              <ContactHours>{contact.hours}</ContactHours>
            </ContactCard>
          ))}
        </ContactList>

        <FooterNote>AI 상담으로 해결되지 않은 사항은 상담원이 직접 안내해 드립니다.</FooterNote>
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
  /* 디자인 기준 콘텐츠 폭 336px + 좌우 패딩 32px */
  width: min(400px, 100%);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  padding: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fff;
  border-radius: 8px;
  text-align: left;
`;

const TitleRow = styled.div`
  width: 100%;
  height: 24px;
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

const ContactList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ContactCard = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
`;

const ContactLabel = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.66px;
  color: #313131;
`;

const ContactNumber = styled.p`
  margin: 0;
  font-size: 22px;
  line-height: 33px;
  letter-spacing: 0.55px;
  color: #222;
`;

const ContactHours = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const FooterNote = styled.p`
  width: 100%;
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  text-align: center;
  color: #919191;
`;
