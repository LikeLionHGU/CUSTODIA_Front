import styled, { css } from "styled-components";
import stepCheck from "../assets/icon_step_check.svg";

// AS 접수 플로우 4단계. 715 · 712 · 720 · 713 네 화면이 공유한다.
const AS_STEPS = ["제품 정보 입력", "AI 예상 견적", "픽업 예약", "예약 완료"];

/**
 * @param {number} current 현재 단계 (1-based)
 *
 * 완료 단계의 체크 글리프는 Figma export(icon_step_check.svg)를 그대로 쓴다.
 * 번호 배지는 CSS 원 + 텍스트로 그린다 — 네 화면이 쓰는 (번호 × 상태) 조합이
 * Figma에 개별 에셋으로 다 준비돼 있지 않기 때문이다. 원·색·크기는 디자인 값 그대로다.
 */
export default function StepIndicator({ current }) {
  return (
    <Wrap>
      {AS_STEPS.map((label, index) => {
        const step = index + 1;
        const state = step < current ? "done" : step === current ? "current" : "upcoming";

        return (
          <Group key={label}>
            <Step>
              {state === "done" ? (
                <DoneBadge>
                  <CheckIcon src={stepCheck} alt="" />
                </DoneBadge>
              ) : (
                <NumberBadge $state={state}>{step}</NumberBadge>
              )}
              <Label $state={state}>{label}</Label>
            </Step>
            {step < AS_STEPS.length && (
              <ConnectorWrap>
                <Connector $muted={index === 0} />
              </ConnectorWrap>
            )}
          </Group>
        );
      })}
    </Wrap>
  );
}

const Wrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  min-height: 26px;
`;

const Group = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const badgeBase = css`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 99px;
  box-sizing: border-box;
`;

const DoneBadge = styled.div`
  ${badgeBase}
  background: #919191;
  border: 1px solid #919191;
`;

const CheckIcon = styled.img`
  width: 8px;
  height: 8px;
`;

const NumberBadge = styled.div`
  ${badgeBase}
  font-size: 11px;
  line-height: 1;

  ${(props) =>
    props.$state === "current"
      ? css`
          background: #222;
          border: 1px solid #222;
          color: #fff;
        `
      : css`
          background: #fff;
          border: 1px solid #919191;
          color: #919191;
        `}
`;

const Label = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.44px;
  white-space: nowrap;

  ${(props) =>
    props.$state === "current"
      ? css`
          font-weight: 500;
          color: #222;
        `
      : css`
          font-weight: 400;
          color: #919191;
        `}
`;

const ConnectorWrap = styled.div`
  display: flex;
  align-items: center;
  padding: 0 8px;
`;

const Connector = styled.div`
  width: 32px;
  height: 1px;
  background: ${(props) => (props.$muted ? "#222" : "#919191")};
  opacity: ${(props) => (props.$muted ? 0.2 : 1)};
`;
