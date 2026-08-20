import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import Button from "../components/Button";
import ConfirmWithdrawModal from "../components/ConfirmWithdrawModal";
import * as member from "../api/member";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, toErrorMessage } from "../api/format";
import { reveal } from "../css/motion";
import { useT } from "../i18n";

// 명세 1-5: PUT /api/member 는 이 세 가지만 받는다. 이메일·생년월일은 변경 대상이 아니다.
const MIN_PASSWORD_LENGTH = 8;

/** 숫자와 하이픈만 남긴다. 서버는 하이픈 없는 숫자를 기대한다. */
function normalizePhone(value) {
  return value.replace(/[^\d-]/g, "");
}

export default function MCM_MyPage() {
  const navigate = useNavigate();
  const t = useT();

  const { data, loading, error, reload } = useApiQuery(() => member.getInfo(), []);

  const [form, setForm] = useState({ name: "", phone: "", agreedMarketing: false });
  const [infoSaving, setInfoSaving] = useState(false);
  const [infoDone, setInfoDone] = useState(false);
  const [infoError, setInfoError] = useState(null);

  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordDone, setPasswordDone] = useState(false);
  const [passwordError, setPasswordError] = useState(null);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState(null);

  // 응답이 오면 편집 가능한 값만 폼으로 옮긴다
  useEffect(() => {
    if (!data) return;
    setForm({
      name: data.name ?? "",
      phone: data.phone ?? "",
      agreedMarketing: !!data.agreedMarketing,
    });
  }, [data]);

  const handleFormChange = (key) => (e) => {
    const value = key === "agreedMarketing" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [key]: key === "phone" ? normalizePhone(value) : value }));
    setInfoDone(false);
    setInfoError(null);
  };

  const infoChanged =
    !!data &&
    (form.name !== (data.name ?? "") ||
      form.phone !== (data.phone ?? "") ||
      form.agreedMarketing !== !!data.agreedMarketing);

  const handleSaveInfo = async () => {
    if (infoSaving) return;

    if (!form.name.trim() || !form.phone.trim()) {
      setInfoError(t("이름과 연락처는 비워 둘 수 없습니다."));
      return;
    }

    setInfoSaving(true);
    setInfoError(null);
    setInfoDone(false);

    try {
      await member.updateInfo({
        name: form.name.trim(),
        phone: form.phone.replace(/-/g, ""),
        agreedMarketing: form.agreedMarketing,
      });
      setInfoDone(true);
      // 서버가 저장한 값을 다시 읽어 화면과 어긋나지 않게 한다
      reload();
    } catch (err) {
      setInfoError(t(toErrorMessage(err, "정보를 저장하지 못했습니다.")));
    } finally {
      setInfoSaving(false);
    }
  };

  const handlePasswordChange = (key) => (e) => {
    setPassword((prev) => ({ ...prev, [key]: e.target.value }));
    setPasswordDone(false);
    setPasswordError(null);
  };

  const handleSavePassword = async () => {
    if (passwordSaving) return;

    if (password.next.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t("새 비밀번호는 {n}자 이상이어야 합니다.", { n: MIN_PASSWORD_LENGTH }));
      return;
    }
    if (password.next !== password.confirm) {
      setPasswordError(t("새 비밀번호가 일치하지 않습니다."));
      return;
    }
    if (password.next === password.current) {
      setPasswordError(t("현재 비밀번호와 다른 비밀번호를 입력해 주세요."));
      return;
    }

    setPasswordSaving(true);
    setPasswordError(null);
    setPasswordDone(false);

    try {
      await member.changePassword({
        currentPassword: password.current,
        newPassword: password.next,
      });
      setPassword({ current: "", next: "", confirm: "" });
      setPasswordDone(true);
    } catch (err) {
      // 명세 부록 C: 현재 비밀번호가 틀리면 401 INVALID_CREDENTIALS
      setPasswordError(
        err.code === "INVALID_CREDENTIALS"
          ? t("현재 비밀번호가 올바르지 않습니다.")
          : t(toErrorMessage(err, "비밀번호를 변경하지 못했습니다.")),
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleWithdraw = async () => {
    if (withdrawing) return;

    setWithdrawing(true);
    setWithdrawError(null);

    try {
      await member.withdraw();
      setWithdrawOpen(false);
      navigate("/", { replace: true });
    } catch (err) {
      setWithdrawError(t(toErrorMessage(err, "탈퇴 처리에 실패했습니다.")));
    } finally {
      setWithdrawing(false);
    }
  };

  const handleLogout = () => {
    member.logout();
    navigate("/", { replace: true });
  };

  const passwordFilled = password.current && password.next && password.confirm;

  return (
    <Page>
      <Body>
        <PageTitle>{t("마이페이지")}</PageTitle>

        {loading && <StateText>{t("불러오는 중…")}</StateText>}
        {!loading && error && <StateText role="alert">{t(toErrorMessage(error))}</StateText>}

        <Columns $pending={loading}>
          <Column>
            <Card>
              <CardHeader>
                <CardHeaderInner>{t("내 정보")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGrid>
                  <FieldGroup>
                    <FieldLabel>{t("이메일")}</FieldLabel>
                    {/* 로그인 수단이라 화면에서 바꾸지 않는다 */}
                    <ReadonlyValue>{data?.email ?? "—"}</ReadonlyValue>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>{t("생년월일")}</FieldLabel>
                    <ReadonlyValue>
                      {data?.birthDate ? formatKoreanDate(data.birthDate) : "—"}
                    </ReadonlyValue>
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="mypage-name">{t("이름")}</FieldLabel>
                    <TextInput
                      id="mypage-name"
                      type="text"
                      autoComplete="name"
                      value={form.name}
                      onChange={handleFormChange("name")}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="mypage-phone">{t("연락처")}</FieldLabel>
                    <TextInput
                      id="mypage-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      placeholder={t("010-0000-0000")}
                      value={form.phone}
                      onChange={handleFormChange("phone")}
                    />
                  </FieldGroup>
                </FieldGrid>

                <CheckboxRow>
                  <Checkbox
                    id="mypage-marketing"
                    type="checkbox"
                    checked={form.agreedMarketing}
                    onChange={handleFormChange("agreedMarketing")}
                  />
                  <CheckboxLabel htmlFor="mypage-marketing">
                    {t("마케팅 정보 수신 동의 (선택)")}
                  </CheckboxLabel>
                </CheckboxRow>

                {infoDone && <DoneText role="status">{t("저장했습니다.")}</DoneText>}
                {infoError && <ErrorText role="alert">{infoError}</ErrorText>}

                <Actions>
                  <Button
                    type="button"
                    onClick={handleSaveInfo}
                    disabled={!infoChanged || infoSaving}
                  >
                    {infoSaving ? t("저장 중…") : t("변경 사항 저장")}
                  </Button>
                </Actions>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardHeaderInner>{t("비밀번호 재설정")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <FieldGroup>
                  <FieldLabel htmlFor="mypage-current-password">
                    {t("현재 비밀번호")}
                  </FieldLabel>
                  <TextInput
                    id="mypage-current-password"
                    type="password"
                    autoComplete="current-password"
                    value={password.current}
                    onChange={handlePasswordChange("current")}
                  />
                </FieldGroup>
                <FieldGrid>
                  <FieldGroup>
                    <FieldLabel htmlFor="mypage-new-password">{t("새 비밀번호")}</FieldLabel>
                    <TextInput
                      id="mypage-new-password"
                      type="password"
                      autoComplete="new-password"
                      value={password.next}
                      onChange={handlePasswordChange("next")}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel htmlFor="mypage-confirm-password">
                      {t("새 비밀번호 확인")}
                    </FieldLabel>
                    <TextInput
                      id="mypage-confirm-password"
                      type="password"
                      autoComplete="new-password"
                      value={password.confirm}
                      onChange={handlePasswordChange("confirm")}
                    />
                  </FieldGroup>
                </FieldGrid>
                <FieldHint>
                  {t("새 비밀번호는 {n}자 이상으로 설정해 주세요.", { n: MIN_PASSWORD_LENGTH })}
                </FieldHint>

                {passwordDone && (
                  <DoneText role="status">{t("비밀번호를 변경했습니다.")}</DoneText>
                )}
                {passwordError && <ErrorText role="alert">{passwordError}</ErrorText>}

                <Actions>
                  <Button
                    type="button"
                    onClick={handleSavePassword}
                    disabled={!passwordFilled || passwordSaving}
                  >
                    {passwordSaving ? t("변경 중…") : t("비밀번호 변경")}
                  </Button>
                </Actions>
              </CardBody>
            </Card>
          </Column>

          <Column>
            <Card>
              <CardHeader>
                <CardHeaderInner>{t("계정")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <SummaryRow>
                  <SummaryLabel>{t("로그인 이메일")}</SummaryLabel>
                  <SummaryValue $muted={!data?.email}>{data?.email ?? "—"}</SummaryValue>
                </SummaryRow>
                <SummaryRow $last>
                  <SummaryLabel>{t("회원 번호")}</SummaryLabel>
                  <SummaryValue $muted={!data?.memberId}>{data?.memberId ?? "—"}</SummaryValue>
                </SummaryRow>
                <Actions>
                  <Button type="button" variant="stroke" onClick={handleLogout}>
                    {t("로그아웃")}
                  </Button>
                </Actions>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardHeaderInner>{t("회원탈퇴")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <WarnList>
                  <WarnItem>
                    {t("탈퇴하면 접수 내역과 수선 이력이 모두 삭제되며 되돌릴 수 없습니다.")}
                  </WarnItem>
                  <WarnItem>
                    {t("진행 중인 수선이 있으면 완료된 뒤에 탈퇴할 수 있습니다.")}
                  </WarnItem>
                </WarnList>
                <Actions>
                  <Button type="button" variant="stroke" onClick={() => setWithdrawOpen(true)}>
                    {t("회원탈퇴")}
                  </Button>
                </Actions>
              </CardBody>
            </Card>
          </Column>
        </Columns>
      </Body>

      <ConfirmWithdrawModal
        open={withdrawOpen}
        submitting={withdrawing}
        error={withdrawError}
        onClose={() => {
          setWithdrawOpen(false);
          setWithdrawError(null);
        }}
        onConfirm={handleWithdraw}
      />
    </Page>
  );
}

const Page = styled.div`
  width: 100%;
  min-height: 100%;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;

const Body = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 48px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 640px) {
    padding: 32px 18px 48px;
  }
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const StateText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #6b6b65;
`;

const Columns = styled.div`
  ${reveal}
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 797fr) minmax(0, 522fr);
  align-items: start;
  gap: 24.5px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 32px;
  }
`;

const Column = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const CardHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
`;

const CardHeaderInner = styled.p`
  width: 100%;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #ededed;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CardBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
`;

const FieldGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FieldGroup = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

const FieldHint = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;

/** 접수 화면과 같은 컨트롤 토큰을 쓴다. */
const fieldBox = `
  width: 100%;
  min-height: var(--control-height);
  box-sizing: border-box;
  padding: 11px 14px;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 20px;
  font-family: inherit;
`;

const TextInput = styled.input`
  ${fieldBox}
  height: var(--control-height);
  background: #fff;
  border: 1px solid #d1d5db;
  color: #222;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #919191;
  }

  &:hover {
    border-color: #919191;
  }

  &:focus {
    border-color: #222;
    box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.08);
  }
`;

/** 바꿀 수 없는 값. 입력창과 같은 크기로 두어 줄이 어긋나지 않게 한다. */
const ReadonlyValue = styled.p`
  ${fieldBox}
  margin: 0;
  display: flex;
  align-items: center;
  background: #f0f0f0;
  border: 1px solid #ededed;
  color: #6b6b65;
`;

const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Checkbox = styled.input`
  width: 15px;
  height: 15px;
  accent-color: #222;
`;

const CheckboxLabel = styled.label`
  font-size: 12px;
  line-height: 18px;
  color: #313131;
  cursor: pointer;
`;

const SummaryRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
`;

const SummaryLabel = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const SummaryValue = styled.span`
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  word-break: break-word;
  color: ${(props) => (props.$muted ? "#919191" : "#222")};
`;

const WarnList = styled.ul`
  margin: 0;
  padding: 0 0 0 16.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const WarnItem = styled.li`
  font-size: 11px;
  line-height: 17.875px;
  color: #6b6b65;
  list-style: disc;
`;

const Actions = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
`;

const DoneText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #4b7c5a;
`;

const ErrorText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #c0392b;
`;
