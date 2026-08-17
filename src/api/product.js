// 2. Product — 제품(보증서) (`/api/product`)
import { get } from "./client";

/**
 * 2-1. GET /api/product/{warrantyNo} — 715 보증서 자동 채움
 * 보증서가 없으면 404. 호출부는 자동 채움만 생략하고 접수를 계속 진행한다.
 */
export const getByWarrantyNo = (warrantyNo) => get(`/product/${encodeURIComponent(warrantyNo)}`);
