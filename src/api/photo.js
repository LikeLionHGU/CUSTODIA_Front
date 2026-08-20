/**
 * 응답에서 대표 제품 사진 주소를 꺼낸다.
 *
 * 서버가 쓰는 이름은 `photoUrl` 이다. 다만 목록·상담 화면은 예전부터
 * `thumbnailUrl` 을 읽고 있어, 두 이름을 이 순서로 본다. 한쪽만 읽으면
 * 다른 엔드포인트에서 사진이 조용히 사라진다.
 *
 * 주소는 손대지 않고 그대로 돌려준다. 서버가 주는 값은 만료 시간이 붙은
 * 서명 URL(절대주소)이고, 표본 데이터에 쓰는 값은 번들러가 만든 자산 주소다.
 * 둘 다 이미 그 자체로 올바르므로, API 주소를 앞에 붙이면 오히려 깨진다.
 */
const KEYS = ["photoUrl", "thumbnailUrl"];

/**
 * @param {object|null|undefined} source 서버 응답
 * @returns {string|null} `<img src>` 에 바로 넣을 수 있는 주소, 없으면 null
 */
export function resolvePhotoUrl(source) {
  if (!source || typeof source !== "object") return null;

  for (const key of KEYS) {
    const value = source[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}
