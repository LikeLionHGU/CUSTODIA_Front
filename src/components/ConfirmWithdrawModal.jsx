import { useEffect, useState } from "react";
import styled from "styled-components";

import Button from "./Button";
import ModalShell, { ModalActions, ModalBody, ModalTitle } from "./ModalShell";
import { useT } from "../i18n";

/**
 * 회원탈퇴 확인 모달.
 *
 * 되돌릴 수 없는 동작이라 확인 문구를 직접 입력해야 버튼이 열린다.
 * 비밀번호 대신 문구 입력을 쓰는 이유는 구글 로그인 계정에는 비밀번호가 없어서다.
 * 본인 확인은 요청에 실려 나가는 Authorization 토큰이 담당한다.
 *
 * @param {boolean}    open
 * @param {() => void} onClose
 * @param {() => void} onConfirm
 * @param {boolean}    submitting
 * @param {string}     error      서버가 돌려준 실패 문구
 */
export default function ConfirmWithdrawModal({ open, onClose, onConfirm, submitting, error }) {
  const t = useT();
  const [typed, setTyped] = useState("");

  // 닫았다 다시 열면 입력값이 남아 있지 않게 비운다
  useEffect(() => {
    if (!open) setTyped("");
  }, [open]);

  const confirmWord = t("탈퇴");
  const canConfirm = typed.trim() === confirmWord && !submitting;

  return (
    <ModalShell open={open} onDismiss={onClose} labelledBy="confirm-withdraw-modal-title">
      <ModalTitle id="confirm-withdraw-modal-title">{t("정말 탈퇴하시겠습니까?")}</ModalTitle>
      <ModalBody>
        {t("탈퇴하면 접수 내역과 수선 이력이 모두 삭제되며 되돌릴 수 없습니다.")}
      </ModalBody>

      <Field>
        <FieldLabel htmlFor="withdraw-confirm">
          {t("계속하려면 {word} 를 입력해 주세요.", { word: confirmWord })}
        </FieldLabel>
        <Input
          id="withdraw-confirm"
          type="text"
          value={typed}
          placeholder={confirmWord}
          autoComplete="off"
          onChange={(e) => setTyped(e.target.value)}
        />
      </Field>

      {error && <ErrorText role="alert">{error}</ErrorText>}

      <ModalActions>
        <Button type="button" variant="stroke" onClick={onClose}>
          {t("닫기")}
        </Button>
        <DangerButton type="button" disabled={!canConfirm} onClick={onConfirm}>
          {submitting ? t("탈퇴 처리 중…") : t("탈퇴하기")}
        </DangerButton>
      </ModalActions>
    </ModalShell>
  );
}

const Field = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  line-height: 18px;
  color: #313131;
`;

const Input = styled.input`
  width: 100%;
  height: var(--control-height);
  box-sizing: border-box;
  padding: 11px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 20px;
  color: #222;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #919191;
  }

  &:focus {
    border-color: #222;
    box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.08);
  }
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #c0392b;
`;

/** 되돌릴 수 없는 동작이라 기본 버튼과 색으로 구분한다. */
const DangerButton = styled(Button)`
  background: #c0392b;

  &:hover {
    background: #a93226;
  }
`;
