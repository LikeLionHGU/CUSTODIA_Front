import { useEffect } from "react";
import styled from "styled-components";

/**
 * 모달 공통 껍데기 — 오버레이·다이얼로그 상자·Esc·배경 스크롤 잠금.
 *
 * 확인 모달 세 개(이탈 확인·로그인 안내·회원탈퇴)가 같은 치수를 쓰므로 여기서만 정한다.
 * `onDismiss` 는 Esc 와 오버레이 클릭에 함께 쓰이는데, 모달마다 "물러나는 쪽"이 다르다.
 * (이탈 확인은 계속 작성, 로그인 안내는 닫기)
 *
 * @param {boolean}    open
 * @param {() => void} onDismiss  Esc·오버레이 클릭 시 호출
 * @param {string}     labelledBy 제목 요소의 id
 */
export default function ModalShell({ open, onDismiss, labelledBy, children }) {
  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onDismiss();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onDismiss]);

  if (!open) return null;

  return (
    <Overlay onClick={onDismiss}>
      <Dialog
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
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

export const ModalTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 21px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

export const ModalBody = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: #6b6b65;
`;

export const ModalActions = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
`;
