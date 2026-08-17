import stepCertificate from "../assets/icon_step_certificate.svg";
import stepCamera from "../assets/icon_step_camera.svg";
import stepSchedule from "../assets/icon_step_schedule.svg";
import stepPackage from "../assets/icon_step_package.svg";

// A/S 접수 안내 콘텐츠. 홈(MCM_Home)의 안내 모달과 AS 접수(AS_Start)의 아코디언이 함께 쓴다.
// iconSize는 AsGuideModal의 60.8px 아이콘 원 기준 글리프 크기 (아이콘마다 비율이 다름)
export const CHECKLIST_ITEMS = [
  {
    number: "01",
    icon: stepCertificate,
    iconSize: { width: 22.9, height: 32.6 },
    label: "구매 증빙",
    desc: "구매 이력 확인에 사용됩니다. 온라인 구매는 주문번호로 대체 가능합니다.",
  },
  {
    number: "02",
    icon: stepCamera,
    iconSize: { width: 34.5, height: 27.6 },
    label: "제품 사진",
    desc: "손상 유형 및 예상 견적 확인을 위해 선명한 사진을 준비해 주세요.",
  },
  {
    number: "03",
    icon: stepSchedule,
    iconSize: { width: 29.5, height: 26.2 },
    label: "수거 일정",
    desc: "접수 후 픽업 예약 단계에서 날짜와 시간대를 선택합니다.",
  },
  {
    number: "04",
    icon: stepPackage,
    iconSize: { width: 32.7, height: 32.7 },
    label: "제품 정리",
    desc: "제품 본체만 인계할 수 있도록 부속품과 개인 소지품을 미리 제거해 주세요.",
  },
];

export const SCHEDULE_ITEMS = [
  { label: "접수 및 픽업 예약", value: "약 10분" },
  { label: "AI 예상 견적 안내", value: "사진 제출 후 즉시" },
  { label: "수선 소요 기간", value: "손상 유형에 따라 상이 (최소 2주)" },
  { label: "최종 견적 확정", value: "실물 진단 완료 후 안내" },
];

export const SERVICE_NOTICES = [
  "CUSTODIA A/S는 정품 부자재와 공인 수선 기술을 사용합니다.",
  "예상 견적은 참고용이며, 실물 진단 후 최종 비용이 확정됩니다.",
  "수선 진행 상황은 리페어 패스포트에서 실시간으로 확인하실 수 있습니다.",
  "신원 확인된 기사가 제품을 직접 수거하며, 운송 구간 전체에 보험이 적용됩니다.",
];
