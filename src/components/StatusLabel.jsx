import styled from "styled-components";

import { useT } from "../i18n";

/**
 * 진행 현황 라벨 (디자인 572:11925).
 *
 * 이 9종이 화면에 쓰이는 상태 표시의 전부다.
 * 문구와 색상 모두 여기서 정하며, 서버의 statusLabel 문구는 쓰지 않는다.
 * (서버 문구는 "수선 진행 중" 처럼 디자인 라벨과 다르기 때문)
 */
const TONES = {
  ESTIMATED: { background: "#f0f0ee", color: "#0a0a0a" }, // 접수중
  PICKUP_BOOKED: { background: "#e9f0f8", color: "#2467b0" }, // 접수완료
  PICKED_UP: { background: "#eff3f1", color: "#078884" }, // 픽업완료
  RECEIVED: { background: "#f0eff5", color: "#675da4" }, // 손상부위 진단중
  DIAGNOSED: { background: "#fbedf0", color: "#ed6384" }, // 손상부위 진단완료
  REPAIRING: { background: "#fcf2e6", color: "#e59b36" }, // 수선중
  INSPECTING: { background: "#f2f4ea", color: "#789741" }, // 검수중
  SHIPPING: { background: "#f5efe9", color: "#795f45" }, // 발송중
  COMPLETED: { background: "#edf5f0", color: "#4b7c5a" }, // 완료
};

/**
 * 위 9종에 없는 상태(ESTIMATE_FAILED · CANCELLED 등)는 디자인에 정의된 색이
 * 없으므로 새로 만들지 않고 접수중 색을 쓴다.
 * DRAFT · ANALYZING 은 목록에 노출되지 않는다.
 */
const FALLBACK = TONES.ESTIMATED;

/**
 * @param {string} status AsStatus 코드 (색상 결정)
 * @param {string} label  서버가 준 표시 문구
 */
export default function StatusLabel({ status, label }) {
  const t = useT();
  const tone = TONES[status] ?? FALLBACK;
  // 서버가 준 한국어 라벨을 사전에 통과시킨다 — 없는 문구는 원문 그대로 보인다
  const text = t(label);

  if (!text) return null;

  return (
    <Pill $tone={tone}>
      <Dot $tone={tone} />
      {text}
    </Pill>
  );
}

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  font-weight: 500;
  line-height: 16.5px;
  white-space: nowrap;
  background: ${(props) => props.$tone.background};
  color: ${(props) => props.$tone.color};
`;

const Dot = styled.span`
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: ${(props) => props.$tone.color};
`;
