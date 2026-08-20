import { useEffect } from "react";
import styled from "styled-components";

import Button from "./Button";
import { useT } from "../i18n";

/**
 * 인증이 필요한 요청이 실패했을 때 띄우는 안내.
 *
 * 화면마다 "접근 권한이 없습니다" 를 본문에 흘리는 대신, 무엇을 해야 하는지
 * (로그인) 한 곳에서 알려 준다. MainLayout 이 요청 계층의 신호를 받아 띄운다.
 *
 * @param {boolean}    open
 * @param {() => void} onClose 닫기 (화면에 그대로 머문다)
 * @param {() => void} onLogin 로그인 화면으로 이동
 */
export default function LoginRequiredModal({ open, onClose, onLogin }) {
  const t = useT();

  useEffect(() => {
    if (!open) return undefined;

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
        aria-labelledby="login-required-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="login-required-modal-title">{t("로그인이 필요합니다")}</DialogTitle>
        <DialogBody>{t("접수 내역과 수선 진행 상황은 로그인 후 확인할 수 있습니다.")}</DialogBody>
        <ButtonRow>
          <Button type="button" variant="stroke" onClick={onClose}>
            {t("닫기")}
          </Button>
          <Button type="button" onClick={onLogin}>
            {t("로그인하기")}
          </Button>
        </ButtonRow>
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
  width: min(400px, 100%);
  max-height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 32px;
  box-sizing: border-box;
  overflow-y: auto;
  background: #fff;
  border-radius: var(--radius-card);
  text-align: left;
`;

const DialogTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const DialogBody = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: #6b6b65;
`;

const ButtonRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;
