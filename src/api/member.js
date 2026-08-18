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

/**
 * 구글 OAuth 클라이언트 ID. 공개용 값이라 코드에 두어도 된다 —
 * 승인된 도메인(localhost:5173 · 3000)에서만 동작하도록 구글이 제어한다.
 * 배포 시 해당 도메인을 Google Cloud Console 에 추가해야 한다.
 */
export const GOOGLE_CLIENT_ID =
  "791833549192-had1roq7sg1d3r8r2u0v7rm1shm8ost5.apps.googleusercontent.com";

/**
 * 1-2b. POST /api/member/login/google · 인증 불필요
 * 구글 SDK 로 받은 ID 토큰을 보내면 우리 JWT 를 돌려준다.
 * → { accessToken, expiresIn, memberId, name, newMember, needsContactInfo }
 */
export async function loginWithGoogle(idToken) {
  const result = await post("/member/login/google", { idToken }, { auth: false });
  if (result?.accessToken) setAccessToken(result.accessToken);
  return result;
}

/** 1-3. GET /api/member/home — 714 홈 → { asCaseList } */
export const getHome = () => get("/member/home");

/** 1-4. GET /api/member/info */
export const getInfo = () => get("/member/info");

/** 1-5. PUT /api/member → { memberId } */
export const updateInfo = (payload) => put("/member", payload);
