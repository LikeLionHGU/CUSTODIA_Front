import Button from "./Button";
import ModalShell, { ModalActions, ModalBody, ModalTitle } from "./ModalShell";
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

  return (
    <ModalShell open={open} onDismiss={onClose} labelledBy="login-required-modal-title">
      <ModalTitle id="login-required-modal-title">{t("로그인이 필요합니다")}</ModalTitle>
      <ModalBody>{t("접수 내역과 수선 진행 상황은 로그인 후 확인할 수 있습니다.")}</ModalBody>
      <ModalActions>
        <Button type="button" variant="stroke" onClick={onClose}>
          {t("닫기")}
        </Button>
        <Button type="button" onClick={onLogin}>
          {t("로그인하기")}
        </Button>
      </ModalActions>
    </ModalShell>
  );
}
