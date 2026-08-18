// 사다리타기 API 클라이언트
// Base URL `/api` · 인증 `Authorization: Bearer {token}` · application/json
// 개발 환경에서는 vite.config.js의 프록시가 /api 를 백엔드로 넘긴다.

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";
const TOKEN_KEY = "mcmCare.accessToken";

/** 명세 부록 C의 에러 코드를 그대로 담는다. */
export class ApiError extends Error {
  constructor(status, code, message, body) {
    super(message || code || `HTTP ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated() {
  return !!getAccessToken();
}

async function parseBody(response) {
  if (response.status === 204) return null;

  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/**
 * @param {string} path      `/member/login` 처럼 BASE_URL 뒤에 붙는 경로
 * @param {object} options
 * @param {string} options.method
 * @param {object} options.body       JSON 바디
 * @param {FormData} options.formData  multipart 바디 (body와 배타)
 * @param {boolean} options.auth      Authorization 헤더 첨부 여부 (기본 true)
 */
export async function request(path, { method = "GET", body, formData, auth = true } = {}) {
  const headers = {};
  const token = getAccessToken();

  if (auth && token) headers.Authorization = `Bearer ${token}`;
  // multipart는 boundary를 브라우저가 붙여야 하므로 Content-Type을 지정하지 않는다.
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });

  const payload = await parseBody(response);

  if (!response.ok) {
    const code = payload?.code;
    // 토큰 만료면 저장된 토큰을 버려 다음 요청이 무한히 실패하지 않게 한다.
    if (response.status === 401 && code === "TOKEN_EXPIRED") clearAccessToken();

    // 화면에는 message 만 노출되므로, 원인 추적용 상세는 콘솔에 남긴다.
    console.error(
      `[API] ${method} ${path} → ${response.status}${code ? ` ${code}` : ""}`,
      payload,
    );
    throw new ApiError(response.status, code, payload?.message, payload);
  }

  return payload;
}

export const get = (path, options) => request(path, { ...options, method: "GET" });
export const post = (path, body, options) => request(path, { ...options, method: "POST", body });
export const put = (path, body, options) => request(path, { ...options, method: "PUT", body });
export const del = (path, options) => request(path, { ...options, method: "DELETE" });

export const postMultipart = (path, formData, options) =>
  request(path, { ...options, method: "POST", formData });

/** GET /api/health · 인증 불필요 */
export const getHealth = () => get("/health", { auth: false });
