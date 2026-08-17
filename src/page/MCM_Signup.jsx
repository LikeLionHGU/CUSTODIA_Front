import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

import * as member from "../api/member";
import { ApiError } from "../api/client";

const fields = [
  { id: "email", label: "이메일*", type: "email", autoComplete: "email" },
  {
    id: "password",
    label: "비밀번호*",
    type: "password",
    autoComplete: "new-password",
  },
  { id: "name", label: "이름*", type: "text", autoComplete: "name" },
  { id: "birthDate", label: "생년월일*", type: "date", autoComplete: "bday" },
  { id: "phone", label: "연락처*", type: "tel", autoComplete: "tel" },
];

const INITIAL_FORM = { email: "", password: "", name: "", birthDate: "", phone: "" };

// 명세 부록 C 기준 에러 메시지
const ERROR_MESSAGES = {
  EMAIL_DUPLICATED: "이미 가입된 이메일입니다.",
  PASSWORD_MISMATCH: "비밀번호가 일치하지 않습니다.",
  FUTURE_BIRTH_DATE: "생년월일은 오늘 이전 날짜여야 합니다.",
  AGREEMENT_REQUIRED: "필수 약관에 동의해 주세요.",
  VALIDATION_FAILED: "입력값을 다시 확인해 주세요.",
};

export default function MCM_Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [agreements, setAgreements] = useState({
    agreedService: true,
    agreedPrivacy: true,
    agreedMarketing: false,
  });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleAgreementChange = (key) => (e) =>
    setAgreements((prev) => ({ ...prev, [key]: e.target.checked }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    if (!agreements.agreedService || !agreements.agreedPrivacy) {
      setError(ERROR_MESSAGES.AGREEMENT_REQUIRED);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await member.signup({
        ...form,
        // 디자인에 비밀번호 확인 입력란이 없어 password 를 그대로 넣는다 (아래 주석 참고)
        passwordConfirm: form.password,
        phone: form.phone.replace(/\D/g, ""),
        ...agreements,
      });
      navigate("/login");
    } catch (err) {
      const code = err instanceof ApiError ? err.code : null;
      setError(ERROR_MESSAGES[code] || err.message || "회원가입에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <SignupCard>
        <Title>회원가입</Title>

        <Form onSubmit={handleSubmit}>
          <Fields>
            {fields.map((field) => (
              <Field key={field.id}>
                <Input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  placeholder=" "
                  autoComplete={field.autoComplete}
                  value={form[field.id]}
                  onChange={handleChange(field.id)}
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </Field>
            ))}
          </Fields>

          <Agreements>
            <Agreement>
              <Checkbox
                type="checkbox"
                checked={agreements.agreedService}
                onChange={handleAgreementChange("agreedService")}
              />
              <span>이용약관 동의 (필수)</span>
            </Agreement>
            <Agreement>
              <Checkbox
                type="checkbox"
                checked={agreements.agreedPrivacy}
                onChange={handleAgreementChange("agreedPrivacy")}
              />
              <span>개인정보 수집·이용 동의 (필수)</span>
            </Agreement>
            <Agreement>
              <Checkbox
                type="checkbox"
                checked={agreements.agreedMarketing}
                onChange={handleAgreementChange("agreedMarketing")}
              />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </Agreement>
          </Agreements>

          {error && <ErrorText role="alert">{error}</ErrorText>}
          <SubmitButton type="submit" disabled={submitting}>
            {submitting ? "가입 중…" : "회원가입"}
          </SubmitButton>
        </Form>

        <LoginGuide>
          이미 계정이 있으신가요? <LoginLink to="/login">로그인</LoginLink>
        </LoginGuide>
      </SignupCard>
    </Page>
  );
}

const Page = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: clamp(65px, 10vh, 120px) 24px 64px;
`;

const SignupCard = styled.section`
  width: min(100%, 443px);
`;

const Title = styled.h1`
  margin: 0 0 32px;
  color: #201213;
  font-size: 18px;
  font-weight: 700;
`;

const Form = styled.form``;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Field = styled.div`
  position: relative;
  height: 52px;
`;

const Label = styled.label`
  position: absolute;
  top: 19px;
  left: 2px;
  color: #777071;
  font-size: 12px;
  line-height: 1;
  pointer-events: none;
  transform-origin: left top;
  transition: top 160ms ease, transform 160ms ease, color 160ms ease;
`;

const Input = styled.input`
  width: 100%;
  height: 52px;
  padding: 17px 2px 4px;
  border: 0;
  border-bottom: 1px solid #4a3b3c;
  border-radius: 0;
  background: transparent;
  color: #201213;

  &:focus {
    border-bottom-color: #1e0f10;
    box-shadow: 0 1px 0 #1e0f10;
  }

  &:focus + ${Label},
  &:not(:placeholder-shown) + ${Label},
  &:-webkit-autofill + ${Label} {
    top: 3px;
    color: #4b3c3d;
    transform: scale(0.86);
  }
`;

const Agreements = styled.div`
  display: flex;
  flex-direction: column;
  gap: 9px;
  margin: 43px 0 45px;
`;

const Agreement = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #797173;
  font-size: 12px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  width: 15px;
  height: 15px;
  accent-color: #6e5e62;
`;

const ErrorText = styled.p`
  margin: 0 0 12px;
  color: #c0392b;
  font-size: 12px;
  line-height: 18px;
`;

const SubmitButton = styled.button`
  width: 100%;
  height: 48px;
  background: #2d1718;
  color: #fff;
  font-size: 13px;
  font-weight: 600;

  &:hover {
    background: #452425;
  }

  &:disabled {
    background: #9b8d8e;
    cursor: default;
  }
`;

const LoginGuide = styled.p`
  margin-top: 43px;
  color: #999293;
  font-size: 11px;
  text-align: center;
`;

const LoginLink = styled(Link)`
  margin-left: 7px;
  color: #3b2c2d;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
`;

