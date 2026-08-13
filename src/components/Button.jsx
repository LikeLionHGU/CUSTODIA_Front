import styled, { css } from "styled-components";

export default function Button({
  variant = "filled",
  size = "default",
  type = "button",
  children,
  ...rest
}) {
  return (
    <StyledButton type={type} $variant={variant} $size={size} {...rest}>
      {children}
    </StyledButton>
  );
}

const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${(props) => (props.$size === "big" ? "16px 32px" : "14px 32px")};
  border-radius: 2px;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 1px;
  text-align: center;
  text-transform: uppercase;
  white-space: nowrap;

  ${(props) =>
    props.$variant === "stroke"
      ? css`
          border: 1px solid #222222;
          background: transparent;
          color: #222222;

          &:hover {
            border-color: #6d707b;
            color: #6d707b;
          }
        `
      : css`
          border: none;
          background: #222222;
          color: #ffffff;

          &:hover {
            background: #6d707b;
          }
        `}
`;
