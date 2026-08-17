// 1. Member — 회원 (`/api/member`)
import { get, post, put, setAccessToken, clearAccessToken } from "./client";

/** 1-1. POST /api/member/signup · 인증 불필요 → { memberId } */
export const signup = (payload) => post("/member/signup", payload, { auth: false });

/**
 * 1-2. POST /api/member/login · 인증 불필요
 * → { accessToken, expiresIn, memberId, name }
 * 성공 시 토큰을 저장한다.
 */
export async function login({ email, password }) {
  const result = await post("/member/login", { email, password }, { auth: false });
  if (result?.accessToken) setAccessToken(result.accessToken);
  return result;
}

export function logout() {
  clearAccessToken();
}

/** 1-3. GET /api/member/home — 714 홈 → { asCaseList } */
export const getHome = () => get("/member/home");

/** 1-4. GET /api/member/info */
export const getInfo = () => get("/member/info");

/** 1-5. PUT /api/member → { memberId } */
export const updateInfo = (payload) => put("/member", payload);
