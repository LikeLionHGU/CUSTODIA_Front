// 6. Chat — AI 상담 (`/api/chat`)
//
// 상담은 별도 FastAPI 서버가 담당하고 스프링은 게이트웨이 역할만 한다.
// 이전 판의 /api/consultation/* 5개는 삭제됐다 (호출하면 404).
import { get, post } from "./client";

/**
 * sessionId 를 매 요청마다 새로 만들면 대화 맥락이 끊긴다.
 * 화면이 살아 있는 동안 같은 값을 유지하기 위해 모듈 수준에 보관한다.
 * 비워서 보내면 서버가 회원 ID 기준(`m{memberId}`)으로 고정해 준다.
 */
let sessionId = null;

export function resetSession() {
  sessionId = null;
}

/** 응답의 session_id 를 기억해 다음 요청에 이어 붙인다. */
function rememberSession(response) {
  if (response?.session_id) sessionId = response.session_id;
  return response;
}

/**
 * 6-2. GET /api/chat/opening — 상담 인사말
 * asNo 가 있으면 그 접수 건 기준으로, 없으면 일반 인사말(718).
 */
export async function getOpening(asNo) {
  const query = asNo ? `?asNo=${encodeURIComponent(asNo)}` : "";
  return rememberSession(await get(`/chat/opening${query}`));
}

/**
 * 6-3. POST /api/chat — 상담 (717 · 718 공용)
 * @param {string} message 사용자 발화
 * @param {string} [asNo]  접수 후 상담(717)일 때만. 없으면 일반 상담(718)
 */
export async function sendMessage(message, asNo) {
  const body = { message };
  if (sessionId) body.sessionId = sessionId;
  if (asNo) body.asNo = asNo;

  return rememberSession(await post("/chat", body));
}
