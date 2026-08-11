import styled from "styled-components";
import { Link } from "react-router-dom";

const fields = [
  { id: "email", label: "이메일*", type: "email", autoComplete: "email" },
  {
    id: "password",
    label: "비밀번호*",
    type: "password",
    autoComplete: "new-password",
  },
  { id: "name", label: "이름*", type: "text", autoComplete: "name" },
  { id: "birthdate", label: "생년월일*", type: "text", autoComplete: "bday" },
  { id: "phone", label: "연락처*", type: "tel", autoComplete: "tel" },
];

export default function Signup() {
  const handleSubmit = (event) => {
    event.preventDefault();
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
                />
                <Label htmlFor={field.id}>{field.label}</Label>
              </Field>
            ))}
          </Fields>

          <Agreements>
            <Agreement>
              <Checkbox type="checkbox" defaultChecked />
              <span>이용약관 동의 (필수)</span>
            </Agreement>
            <Agreement>
              <Checkbox type="checkbox" defaultChecked />
              <span>개인정보 수집·이용 동의 (필수)</span>
            </Agreement>
            <Agreement>
              <Checkbox type="checkbox" />
              <span>마케팅 정보 수신 동의 (선택)</span>
            </Agreement>
          </Agreements>

          <SubmitButton type="submit">회원가입</SubmitButton>
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

