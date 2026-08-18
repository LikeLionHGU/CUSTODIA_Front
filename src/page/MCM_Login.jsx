import { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

import { GoogleLogin } from "@react-oauth/google";

import * as member from "../api/member";

export default function MCM_Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

  /**
   * 구글 SDK 가 준 ID 토큰(credential)을 서버로 넘기면 우리 JWT 가 온다.
   * 소셜 가입자는 연락처가 없어 픽업 예약에서 막히므로 needsContactInfo 를 확인한다.
   */
  const handleGoogleSuccess = async (credentialResponse) => {
    setError(null);
    try {
      const result = await member.loginWithGoogle(credentialResponse.credential);
      if (result.needsContactInfo) {
        // 마이페이지 화면이 아직 없어 홈으로 보내되 안내는 남긴다
        alert("픽업 예약을 위해 연락처 입력이 필요합니다.");
      }
      navigate("/");
    } catch (err) {
      setError(err.message || "구글 로그인에 실패했습니다.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      await member.login(form);
      navigate("/");
    } catch (err) {
      // 명세 1-2: 이메일·비밀번호 오류를 구분하지 않고 401 INVALID_CREDENTIALS
      setError(
        err.code === "INVALID_CREDENTIALS"
          ? "이메일 또는 비밀번호가 올바르지 않습니다."
          : err.message || "로그인에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <LoginCard>
        <HeadingGroup>
          <Title>로그인</Title>
          <Description>
            회원으로 가입하시면 빠르고 편리하게 이용하실 수 있습니다.
          </Description>
        </HeadingGroup>

        <Form onSubmit={handleSubmit}>
          <Field>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder=" "
              autoComplete="email"
              value={form.email}
              onChange={handleChange("email")}
            />
            <Label htmlFor="email">이메일*</Label>
          </Field>
          <Field>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder=" "
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange("password")}
            />
            <Label htmlFor="password">비밀번호*</Label>
          </Field>
          {error && <ErrorText role="alert">{error}</ErrorText>}
          <LoginButton type="submit" disabled={submitting}>
            {submitting ? "로그인 중…" : "로그인"}
          </LoginButton>
        </Form>

        <Divider><span>또는</span></Divider>

        {/* useGoogleLogin 은 access token 만 주고 ID 토큰을 주지 않는다.
            서버가 ID 토큰만 검증하므로 공식 GoogleLogin 컴포넌트를 쓴다. */}
        <GoogleButtonWrap>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => setError("구글 로그인에 실패했습니다.")}
            width="443"
          />
        </GoogleButtonWrap>

        <SignupText>
          계정이 없으신가요? <SignupLink to="/signup">가입하기</SignupLink>
        </SignupText>
      </LoginCard>
    </Page>
  );
}

const Page = styled.main`
  flex: 1;
  display: flex;
  justify-content: center;
  padding: clamp(88px, 18vh, 210px) 24px 80px;
`;

const LoginCard = styled.section`
  width: min(100%, 443px);
`;

const HeadingGroup = styled.div`
  margin-bottom: 43px;
`;

const Title = styled.h1`
  margin: 0 0 8px;
  color: #1f1112;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
`;

const Description = styled.p`
  color: #28191a;
  font-size: 13px;
  font-weight: 400;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
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

const ErrorText = styled.p`
  margin: 12px 0 0;
  color: #c0392b;
  font-size: 12px;
  line-height: 18px;
`;

const LoginButton = styled.button`
  width: 100%;
  height: 48px;
  margin-top: 17px;
  background: #2d1718;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  transition: background 160ms ease;

  &:hover {
    background: #452425;
  }

  &:disabled {
    background: #9b8d8e;
    cursor: default;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  color: #8a8383;
  font-size: 11px;
`;


const GoogleButtonWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const SignupText = styled.p`
  margin-top: 49px;
  color: #999293;
  font-size: 11px;
  text-align: center;
`;

const SignupLink = styled(Link)`
  margin-left: 7px;
  color: #3b2c2d;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
`;
