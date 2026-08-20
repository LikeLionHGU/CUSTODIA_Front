import { useEffect, useState } from "react";
import styled from "styled-components";

import Button from "./Button";
import ModalShell, { ModalActions, ModalBody, ModalTitle } from "./ModalShell";
import { useT } from "../i18n";

/**
 * AI 가 손상을 찾지 못했을 때, 픽업 예약으로 넘어가기 전에 한 번 더 손상 내용을 받는 모달.
 *
 * 접수 건의 손상 설명을 고치는 API 가 아직 없어서, 여기서 적은 내용은
 * 픽업 예약의 "수거 시 전달 사항" 으로 이어져 기사·수선센터에 함께 전달된다.
 *
 * @param {boolean} open
 * @param {string}  defaultValue 처음 채워 둘 문구
 * @param {() => void} onClose
 * @param {(text: string) => void} onSubmit 입력한 문구를 들고 다음 단계로
 */
export default function DamageDetailModal({ open, defaultValue = "", onClose, onSubmit }) {
  const t = useT();
  const [text, setText] = useState(defaultValue);

  // 다시 열 때는 넘겨받은 기본값에서 시작한다
  useEffect(() => {
    if (open) setText(defaultValue);
  }, [open, defaultValue]);

  return (
    <ModalShell open={open} onDismiss={onClose} labelledBy="damage-detail-modal-title">
      <ModalTitle id="damage-detail-modal-title">{t("상세 손상 내용 확인")}</ModalTitle>
      <ModalBody>
        {t(
          "AI가 사진에서 손상을 찾지 못했습니다. 손상 위치와 상태를 직접 적어 주시면 수선센터가 함께 확인합니다.",
        )}
      </ModalBody>

      <Field>
        <FieldLabel htmlFor="damage-detail">{t("상세 손상 내용")}</FieldLabel>
        <TextArea
          id="damage-detail"
          value={text}
          placeholder={t("예: 안쪽 지퍼가 잘 닫히지 않고, 손잡이 가죽이 갈라졌습니다.")}
          onChange={(e) => setText(e.target.value)}
        />
      </Field>

      <ModalActions>
        <Button type="button" variant="stroke" onClick={onClose}>
          {t("취소")}
        </Button>
        <Button type="button" onClick={() => onSubmit(text.trim())}>
          {t("확인하고 계속")}
        </Button>
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 112px;
  box-sizing: border-box;
  padding: 11px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 20px;
  color: #222;
  font-family: inherit;
  resize: vertical;
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
