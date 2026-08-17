// 6. Consultation — AI 상담 (`/api/consultation`)
import { get, post } from "./client";

/**
 * 6-1. GET /api/consultation/select — 711 AS 건 선택
 * 목록이 비면 호출부가 "AS 이력이 없어요" 경로로 이동한다.
 */
export const getSelectList = () => get("/consultation/select");

/**
 * 6-2. POST /api/consultation — 717 · 718 · 716 상담 시작
 * asNo 를 넘기지 않으면 이력 없는 신규 상담(718)이 되고 asNo/modelName/statusLabel 이 null 이다.
 */
export const create = (asNo) => post("/consultation", asNo ? { asNo } : {});

/** 6-3. POST /api/consultation/{consultationId}/message → { role, content, createdAt } */
export const sendMessage = (consultationId, content) =>
  post(`/consultation/${consultationId}/message`, { content });

/** 6-4. GET /api/consultation/{consultationId} — 대화 이력 (CreateResDto 동일) */
export const getDetail = (consultationId) => get(`/consultation/${consultationId}`);

/** 6-5. POST /api/consultation/{consultationId}/handoff — 상담원 연결 */
export const handoff = (consultationId) => post(`/consultation/${consultationId}/handoff`);
