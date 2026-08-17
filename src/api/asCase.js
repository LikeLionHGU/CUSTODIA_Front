// 3. AsCase — AS 접수 (`/api/asCase`)
import { get, post, del, postMultipart } from "./client";

/** 3-1. GET /api/asCase/form — 715 폼 초기 데이터 → { productTypeList, purchaseChannelList, damageTypeList } */
export const getForm = () => get("/asCase/form");

/**
 * 3-2. POST /api/asCase · multipart/form-data — 715 예상 견적 확인하기
 * 접수 생성과 AI 견적 분석을 함께 수행한다.
 *
 * @param {object} request  CreateReqDto (photoTypeList는 images 순서와 1:1 대응)
 * @param {File[]} images   1~3장
 * @returns {Promise<{asNo: string}>}
 *
 * AI 분석 실패 시 502 ESTIMATE_FAILED 가 던져지지만, 접수 건 자체는 저장되며
 * 에러 바디의 `asNo` 로 견적 화면에 진입해 재분석할 수 있다.
 */
export function create(request, images) {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(request)], { type: "application/json" }),
  );
  images.forEach((image) => formData.append("images", image));
  return postMultipart("/asCase", formData);
}

/** 3-3. GET /api/asCase/estimate/{asNo} — 712 AI 예상 견적 결과 */
export const getEstimate = (asNo) => get(`/asCase/estimate/${encodeURIComponent(asNo)}`);

/** 3-4. POST /api/asCase/estimate/{asNo} — 견적 재분석 (요청 바디 없음) */
export const retryEstimate = (asNo) => post(`/asCase/estimate/${encodeURIComponent(asNo)}`);

/**
 * 3-5. POST /api/asCase/list — 710 나의 AS 목록
 * @param {"ALL"|"IN_PROGRESS"|"COMPLETED"} filter
 */
export const getList = ({ filter = "ALL", page = 0, size = 20 } = {}) =>
  post("/asCase/list", { filter, page, size });

/** 3-6. GET /api/asCase/detail/{asNo} — 716 나의 AS 상세 */
export const getDetail = (asNo) => get(`/asCase/detail/${encodeURIComponent(asNo)}`);

/** 3-7. GET /api/asCase/handover/{asNo} — 719 인계 완료 확인 */
export const getHandover = (asNo) => get(`/asCase/handover/${encodeURIComponent(asNo)}`);

/** 3-8. DELETE /api/asCase/{asNo} — 접수 취소 (상태를 CANCELLED 로 전이) */
export const cancel = (asNo) => del(`/asCase/${encodeURIComponent(asNo)}`);
