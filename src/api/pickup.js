// 4. Pickup — 픽업 예약 (`/api/pickup`)
import { get, post, del } from "./client";

/** 4-1. GET /api/pickup/form/{asNo} — 720 진입 → { asNo, modelName, statusLabel, photoUrl, phone } */
export const getForm = (asNo) => get(`/pickup/form/${encodeURIComponent(asNo)}`);

/**
 * 4-2. POST /api/pickup/slot — 720 예약 가능 슬롯
 * startDate 생략 시 오늘, endDate 생략 시 startDate + 14일
 * @returns {Promise<{dateList: Array<{date: string, slotList: Array<{slotStart, slotEnd, available}>}>}>}
 */
export const getSlots = ({ startDate, endDate } = {}) =>
  post("/pickup/slot", { startDate, endDate });

/** 4-3. POST /api/pickup/{asNo} — 720 예약 확정 → { pickupNo } */
export const create = (asNo, payload) => post(`/pickup/${encodeURIComponent(asNo)}`, payload);

/** 4-4. GET /api/pickup/complete/{pickupNo} — 713 예약 완료 화면 */
export const getComplete = (pickupNo) => get(`/pickup/complete/${encodeURIComponent(pickupNo)}`);

/** 4-5. GET /api/pickup/{pickupNo} — 예약 조회 (CompleteResDto + phone, note) */
export const getDetail = (pickupNo) => get(`/pickup/${encodeURIComponent(pickupNo)}`);

/** 4-6. DELETE /api/pickup/{pickupNo} — 예약 취소 (예정일 24시간 전까지) */
export const cancel = (pickupNo) => del(`/pickup/${encodeURIComponent(pickupNo)}`);
