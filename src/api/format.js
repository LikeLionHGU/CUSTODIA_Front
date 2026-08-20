// API 응답의 날짜·금액을 화면 표기로 바꾸는 헬퍼.
// 서버는 `2025-08-04` (LocalDate) 또는 `2024-11-20T14:32:00` (LocalDateTime) 을 준다.

// 현재 화면 언어. LanguageProvider 가 자식을 그리기 직전에 맞춰 준다.
// (훅으로 만들면 모든 호출부를 컴포넌트 안으로 옮겨야 해서 모듈 상태로 둔다)
const INTL_LOCALE = { ko: "ko-KR", en: "en-US", de: "de-DE" };
let currentLocale = INTL_LOCALE.ko;

export function setFormatLocale(lang) {
  currentLocale = INTL_LOCALE[lang] ?? INTL_LOCALE.ko;
}

function toParts(value) {
  if (!value) return null;
  const [datePart] = String(value).split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  if (!year || !month || !day) return null;
  return { year, month, day };
}

/** `2025-08-04` → `2025년 8월 4일` · `August 4, 2025` · `4. August 2025` */
export function formatKoreanDate(value) {
  const parts = toParts(value);
  if (!parts) return "";

  return new Intl.DateTimeFormat(currentLocale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(parts.year, parts.month - 1, parts.day));
}

/** `2025-08-04` → `2025.08.04` */
export function formatDotDate(value) {
  const parts = toParts(value);
  if (!parts) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${parts.year}.${pad(parts.month)}.${pad(parts.day)}`;
}

/** `2024-11-20T14:32:00` → `2024년 11월 20일 14:32` (날짜 부분만 언어를 따른다) */
export function formatKoreanDateTime(value) {
  const parts = toParts(value);
  if (!parts) return "";

  const time = String(value).split("T")[1];
  if (!time) return formatKoreanDate(value);

  const [hour, minute] = time.split(":");
  return `${formatKoreanDate(value)} ${hour}:${minute}`;
}

/** `80000` → `₩ 80,000` (자릿수 구분 기호는 언어를 따른다) */
export function formatWon(value) {
  if (value == null) return "";
  return `₩ ${Number(value).toLocaleString(currentLocale)}`;
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
  if (error.status === 401) return "로그인이 필요합니다.";
  // 서버는 미인증·만료·권한없음을 모두 403 NO_PERMISSION 으로 준다.
  // 사용자가 할 수 있는 조치는 어느 쪽이든 로그인이므로 그렇게 안내한다.
  // (같은 상황에서 LoginRequiredModal 도 함께 떠서 문구가 어긋나지 않는다)
  if (error.code === "NO_PERMISSION") return "로그인이 필요합니다.";

  // fetch 자체가 실패하면(서버 다운·네트워크 차단·CORS) ApiError 가 아니라 TypeError 가 온다
  if (error.name === "TypeError") return "서버에 연결하지 못했습니다. 잠시 후 다시 시도해 주세요.";

  // ApiError 의 message 는 서버가 문구를 안 줬을 때 "HTTP 404" 같은 내부 표기로 채워진다.
  // 백엔드에 닿지 못한 배포본에서 그게 그대로 노출되지 않도록, 서버가 준 문구만 그대로 쓴다.
  if (error.name === "ApiError") return error.body?.message || fallback;

  return error.message || fallback;
}
