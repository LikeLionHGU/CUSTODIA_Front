// API 응답의 날짜 문자열을 화면 표기로 바꾸는 헬퍼.
// 서버는 `2025-08-04` (LocalDate) 또는 `2024-11-20T14:32:00` (LocalDateTime) 을 준다.

function toParts(value) {
  if (!value) return null;
  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

/** `2025-08-04` → `2025년 8월 4일` */
export function formatKoreanDate(value) {
  const parts = toParts(value);
  if (!parts) return "";
  return `${parts.year}년 ${parts.month}월 ${parts.day}일`;
}

/** `2025-08-04` → `2025.08.04` */
export function formatDotDate(value) {
  const parts = toParts(value);
  if (!parts) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parts.year}.${pad(parts.month)}.${pad(parts.day)}`;
}

/** `2024-11-20T14:32:00` → `2024년 11월 20일 14:32` */
export function formatKoreanDateTime(value) {
  const parts = toParts(value);
  if (!parts) return "";

  const time = String(value).split("T")[1];
  if (!time) return formatKoreanDate(value);

  const [hour, minute] = time.split(":");
  return `${formatKoreanDate(value)} ${hour}:${minute}`;
}

/** `80000` → `₩ 80,000` */
export function formatWon(value) {
  if (value == null) return "";
  return `₩ ${Number(value).toLocaleString("ko-KR")}`;
}

/** `80000`, `120000` → `₩ 80,000 – ₩ 120,000` */
export function formatWonRange(min, max) {
  if (min == null && max == null) return "";
  if (min == null || max == null) return formatWon(min ?? max);
  return `${formatWon(min)} – ${formatWon(max)}`;
}

/** 사용자에게 보여줄 에러 문구. 서버 message 를 우선 쓰고 없으면 기본 문구. */
export function toErrorMessage(error, fallback = "정보를 불러오지 못했습니다.") {
  if (!error) return fallback;
  if (error.code === "NO_MATCHING_DATA") return "요청하신 정보를 찾을 수 없습니다.";
  if (error.code === "NO_PERMISSION") return "접근 권한이 없습니다.";
  if (error.status === 401) return "로그인이 필요합니다.";
  return error.message || fallback;
}
