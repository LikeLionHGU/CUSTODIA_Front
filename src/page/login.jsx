import styled from "styled-components";
import { Link } from "react-router-dom";

import GoogleIcon from "../assets/icon_google.svg";

export default function Login() {
  const handleSubmit = (event) => {
    event.preventDefault();
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
            />
            <Label htmlFor="password">비밀번호*</Label>
          </Field>
          <LoginButton type="submit">로그인</LoginButton>
        </Form>

        <Divider><span>또는</span></Divider>

        <GoogleButton type="button">
          <img src={GoogleIcon} alt="" />
          <span>구글로 로그인</span>
        </GoogleButton>

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
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  color: #8a8383;
  font-size: 11px;
`;

const GoogleButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  border: 1px solid #4b3b3c;
  color: #201213;
  font-size: 13px;
  font-weight: 600;

  img {
    position: absolute;
    left: 15px;
    width: 24px;
    height: 24px;
  }

  &:hover {
    background: #faf7f7;
  }
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
