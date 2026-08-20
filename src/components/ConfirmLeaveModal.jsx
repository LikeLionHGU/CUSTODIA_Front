import Button from "./Button";
import ModalShell, { ModalActions, ModalBody, ModalTitle } from "./ModalShell";
import { useT } from "../i18n";

/**
 * 작성 중인 내용을 두고 화면을 벗어나려 할 때 한 번 확인받는 모달.
 *
 * 접수 내용은 "예상 견적 확인하기" 를 누를 때만 서버로 올라간다.
 * 그래서 여기서 나가면 입력값은 어디에도 남지 않으며, 이 모달은 그 사실을 알려 준다.
 *
 * @param {boolean}    open
 * @param {() => void} onStay  계속 작성 (이동 취소)
 * @param {() => void} onLeave 나가기 (이동 진행)
 */
export default function ConfirmLeaveModal({ open, onStay, onLeave }) {
  const t = useT();

  // 실수로 작성 내용을 날리지 않도록, Esc·배경 클릭은 "계속 작성" 쪽에 붙인다.
  return (
    <ModalShell open={open} onDismiss={onStay} labelledBy="confirm-leave-modal-title">
      <ModalTitle id="confirm-leave-modal-title">
        {t("작성 중인 접수를 나가시겠습니까?")}
      </ModalTitle>
      <ModalBody>{t("작성하신 내용은 저장되지 않습니다.")}</ModalBody>
      <ModalActions>
        <Button type="button" variant="stroke" onClick={onStay}>
          {t("계속 작성")}
        </Button>
        <Button type="button" onClick={onLeave}>
          {t("나가기")}
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
