import { css, keyframes } from "styled-components";

const rise = keyframes`
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
`;

/**
 * 자리는 미리 잡아 두고 값만 늦게 채워지는 블록용.
 * `$pending` 이 풀리는 순간 떠오르며 나타난다. 자리를 계속 차지하므로
 * 응답이 와도 레이아웃이 밀리지 않고, 로딩 문구는 이 블록 밖에서 그대로 보인다.
 */
export const reveal = css`
  opacity: ${(props) => (props.$pending ? 0 : 1)};
  transform: ${(props) => (props.$pending ? "translateY(6px)" : "none")};
  pointer-events: ${(props) => (props.$pending ? "none" : "auto")};
  transition:
    opacity 0.36s ease,
    transform 0.36s cubic-bezier(0.22, 1, 0.36, 1);

  @media (prefers-reduced-motion: reduce) {
    transform: none;
    transition-duration: 0.01s;
  }
`;

/**
 * 응답이 온 뒤에야 마운트되는 블록용 — 붙는 순간 한 번 재생된다.
 * 목록처럼 여러 개가 한꺼번에 붙을 때는 `$index` 로 조금씩 늦춰 차례로 올라오게 한다.
 */
export const revealOnMount = css`
  animation: ${rise} 0.36s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: ${(props) => Math.min(props.$index ?? 0, 6) * 60}ms;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;
