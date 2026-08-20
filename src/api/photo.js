/**
 * 응답에서 대표 제품 사진 주소를 꺼낸다.
 *
 * 엔드포인트마다 이름이 다르다 (실제 응답 확인 기준):
 * - `GET /asCase/detail/{asNo}`  → `photoUrlList` (배열)
 * - `GET /asCase/estimate/{asNo}` → `photoUrlList` (배열)
 * - `POST /asCase/list`           → `thumbnailUrl`
 * - `GET /pickup/form/{asNo}`     → `photoUrl`
 *
 * 값은 만료 시각과 서명이 붙은 절대주소라 그대로 쓴다. 저장해 두고 재사용하면
 * 만료 후 깨지므로, 화면을 다시 조회해서 받은 값을 써야 한다.
 */
const SINGLE_KEYS = ["photoUrl", "thumbnailUrl"];
const LIST_KEYS = ["photoUrlList", "asPhotoUrlList"];

/**
 * @param {object|null|undefined} source 서버 응답
 * @returns {string|null} `<img src>` 에 바로 넣을 수 있는 주소, 없으면 null
 */
export function resolvePhotoUrl(source) {
  if (!source || typeof source !== "object") return null;

  for (const key of SINGLE_KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }

  for (const key of LIST_KEYS) {
    const list = source[key];
    if (!Array.isArray(list)) continue;
    const found = list.find((entry) => typeof entry === "string" && entry.trim());
    if (found) return found.trim();
  }

  return null;
}
