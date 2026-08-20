import { useEffect } from "react";
import styled from "styled-components";

import Button from "./Button";
import { useT } from "../i18n";

/**
 * 작성 중인 내용을 두고 화면을 벗어나려 할 때 한 번 확인받는 모달.
 *
 * 접수 내용은 "예상 견적 확인하기" 를 누를 때만 서버로 올라간다.
 * 그래서 여기서 나가면 입력값은 어디에도 남지 않으며, 이 모달은 그 사실을 알려 준다.
 *
 * @param {boolean}  open      열림 여부
 * @param {() => void} onStay  계속 작성 (이동 취소)
 * @param {() => void} onLeave 나가기 (이동 진행)
 */
export default function ConfirmLeaveModal({ open, onStay, onLeave }) {
  const t = useT();

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      // 실수로 나가지 않도록, Esc 는 "계속 작성" 쪽으로 붙인다
      if (e.key === "Escape") onStay();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onStay]);

  if (!open) return null;

  return (
    <Overlay onClick={onStay}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-leave-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle id="confirm-leave-modal-title">{t("작성 중인 접수를 나가시겠습니까?")}</DialogTitle>
        <DialogBody>{t("작성하신 내용은 저장되지 않습니다.")}</DialogBody>
        <ButtonRow>
          <Button type="button" variant="stroke" onClick={onStay}>
            {t("계속 작성")}
          </Button>
          <Button type="button" onClick={onLeave}>
            {t("나가기")}
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
