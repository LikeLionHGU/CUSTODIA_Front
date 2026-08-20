import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as pickup from "../api/pickup";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, toErrorMessage } from "../api/format";
import calendarIcon from "../assets/icon_calendar.svg";
import infoIcon from "../assets/icon_info.svg";
import backArrow from "../assets/icon_back_arrow.svg";
import StepIndicator from "../components/StepIndicator";
import safetyDriverId from "../assets/safety_driver_id.jpg";
import safetyPhotoRecord from "../assets/safety_photo_record.jpg";
import safetySignature from "../assets/safety_signature.jpg";
import safetyInsurance from "../assets/safety_insurance.jpg";
import styled from "styled-components";
import { useT } from "../i18n";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

// 명세 4-3 검증 표
const PICKUP_ERRORS = {
  SLOT_FULL: "선택하신 시간대가 마감되었습니다. 다른 시간대를 선택해 주세요.",
  PICKUP_ALREADY_EXISTS: "이미 예약된 픽업이 있습니다. 기존 예약을 취소한 뒤 다시 시도해 주세요.",
  PAST_DATE: "지난 날짜·시간대는 선택할 수 없습니다.",
  NO_AVAILABLE_DRIVER: "배정 가능한 기사가 없습니다. 다른 일정을 선택해 주세요.",
  INVALID_STATUS: "예약할 수 없는 접수 상태입니다.",
};

/** Date → `2026-08-18` (API가 쓰는 LocalDate 형식) */
function toDateKey(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// 안전 인계 안내 카드. 이미지는 Figma export 원본을 그대로 쓴다.
const SAFETY_ITEMS = [
  {
    label: "기사 신원 확인",
    desc: "픽업 기사는 신원 확인된 MCM 케어 파트너 기사입니다.",
    image: safetyDriverId,
  },
  {
    label: "인계 전후 사진 기록",
    desc: "인계 전후 제품 상태 사진과 전자서명이 접수 건에 자동으로 기록됩니다.",
    image: safetyPhotoRecord,
  },
  {
    label: "고객·기사 전자서명",
    desc: "인계 완료 시 고객님과 기사 양측이 전자서명으로 인계를 확인합니다.",
    image: safetySignature,
  },
  {
    label: "운송 보험 자동 적용",
    desc: "픽업부터 수선 센터 도착까지 전 구간 운송 보험이 자동 적용됩니다.",
    image: safetyInsurance,
  },
];

// 우측 다크 패널의 유의사항 목록
const INSURANCE_NOTES = [
  "픽업 시 운송 보험이 자동 적용되며, 수선센터 도착까지 제품을 보호합니다.",
  "예약 확정 후 취소는 픽업 예정일 24시간 전까지 가능합니다.",
  "최종 비용은 실물 진단 후 안내되며, 예상 견적은 참고용입니다.",
];

function getTomorrow() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  return d;
}

function isSameDate(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** `2026년 8월 18일 (화)` — 날짜 본문은 언어별 표기를 따르고 요일만 따로 번역한다 */
function formatDateKorean(date, t) {
  if (!date) return "";
  return `${formatKoreanDate(toDateKey(date))} (${t(WEEKDAYS_KO[date.getDay()])})`;
}

function buildCalendarDays(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

function formatPhoneNumber(digits) {
  if (digits.length < 4) return digits;
  if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
}


const Page = styled.div`
  width: 100%;
  min-height: 100%;
  background: #f9f9f9;
  box-sizing: border-box;
  text-align: left;
`;


const Body = styled.div`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 27px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;

  @media (max-width: 640px) {
    padding: 24px 18px 48px;
  }
`;

const BackLink = styled.button`
  align-self: flex-start;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 23px;
  padding: 0;
  border: none;
  background: none;
  font-size: 10px;
  line-height: 10px;
  color: #919191;
  text-transform: uppercase;
  cursor: pointer;
`;

const BackArrow = styled.img`
  width: 8px;
  height: 4px;
  transform: rotate(90deg);
`;

/**
 * 제목 · 단계 표시 · 확정 버튼.
 * 양쪽 칸을 같은 1fr 로 두어, 제목과 버튼의 글자 수가 달라져도(언어 전환 포함)
 * 가운데 단계 표시가 화면 중앙에 그대로 머문다.
 */
const TopRow = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 24px;
  margin-bottom: 38px;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    justify-items: start;
    gap: 20px;
  }
`;

const StepWrap = styled.div`
  display: flex;
  justify-content: center;
`;

const TopActions = styled.div`
  display: flex;
  justify-content: flex-end;

  @media (max-width: 1200px) {
    justify-content: flex-start;
  }
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const SubmitError = styled.p`
  width: 100%;
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #c0392b;
`;

const Columns = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  align-items: start;
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const LeftColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 32px;
  /* 왼쪽 폼을 스크롤해도 예약 요약이 따라오도록 고정한다 (헤더 80px + 여백 16px) */
  position: sticky;
  top: 96px;

  @media (max-width: 900px) {
    position: static;
    top: auto;
  }
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const CardHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
`;

const CardHeaderInner = styled.p`
  width: 100%;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #ededed;
  box-sizing: border-box;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CardBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
`;


const ReceiptRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
`;

/** 제품 사진 자리. 사진이 없어도 카드 높이가 흔들리지 않게 상자를 그대로 둔다. */
const Thumb = styled.div`
  flex-shrink: 0;
  width: 140px;
  height: 100px;
  overflow: hidden;
  background: #f2f2f0;
  border-radius: var(--radius-card);
`;

const ThumbImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ReceiptTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ProductName = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
  color: #222;
`;

const ReceiptMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ReceiptNo = styled.p`
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px;
  font-size: 12px;
  line-height: 18px;
`;

const ReceiptNoLabel = styled.span`
  color: #919191;
`;

const ReceiptNoValue = styled.span`
  font-weight: 500;
  color: #222;
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 4px;
`;

/** 견적 안내가 끝난 상태에서만 들어오는 화면이라 디자인의 완료 색을 그대로 쓴다. */
const StatusDot = styled.span`
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: #4b7c5a;
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #4b7c5a;
`;

const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const FieldLabel = styled.label`
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

/** 픽업 날짜·시간대는 나란히 두고, 좁은 화면에서만 한 줄로 내린다. */
const FieldGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const FieldHint = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;

/**
 * 접수 화면(AS_ProductInfo)과 같은 컨트롤 스타일.
 * 같은 플로우의 앞 단계와 높이·모서리·포커스 링이 어긋나지 않게 토큰을 공유한다.
 */
const fieldBox = `
  width: 100%;
  min-height: var(--control-height);
  box-sizing: border-box;
  padding: 11px 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-control);
  font-size: 12px;
  line-height: 20px;
  color: #222;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #919191;
  }

  &:hover:not(:disabled) {
    border-color: #919191;
  }

  &:focus {
    border-color: #222;
    box-shadow: 0 0 0 3px rgba(34, 34, 34, 0.08);
  }
`;

const TextInput = styled.input`
  ${fieldBox}
  height: var(--control-height);
`;

const TextArea = styled.textarea`
  ${fieldBox}
  min-height: 112px;
  resize: vertical;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  ${fieldBox}
  height: var(--control-height);
  padding-right: 36px;
  appearance: none;
  color: ${(props) => (props.$hasValue ? "#222" : "#919191")};
`;

const SelectBox = styled.button`
  ${fieldBox}
  height: var(--control-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  text-align: left;
  cursor: pointer;
  color: ${(props) => (props.$hasValue ? "#222" : "#919191")};
`;

const CalendarIcon = styled.img`
  flex-shrink: 0;
  width: 18px;
  height: 18px;
`;


const SelectChevronWrap = styled.span`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  display: flex;
  pointer-events: none;
`;

const CalendarPopover = styled.div`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  z-index: 20;
  width: 280px;
  box-sizing: border-box;
  padding: 12px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.12);
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const CalendarNavButton = styled.button`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: none;
  color: #1f2937;
  font-size: 14px;
  cursor: pointer;
`;

const CalendarTitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const CalendarWeekday = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  font-size: 11px;
  color: #6b7280;
`;

const CalendarDay = styled.button`
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  background: ${(props) => (props.$selected ? "#1f2937" : "transparent")};
  color: ${(props) => (props.$selected ? "#fff" : props.$disabled ? "#d1d5db" : "#1f2937")};
  cursor: ${(props) => (props.$disabled ? "not-allowed" : "pointer")};

  &:hover {
    background: ${(props) => (props.$disabled ? "transparent" : props.$selected ? "#1f2937" : "#f3f4f6")};
  }
`;

const SafetyGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const SafetyItem = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  overflow: hidden;
  border: 1px solid #e8e8e4;
  border-radius: var(--radius-card);
`;

const SafetyImage = styled.img`
  width: 100%;
  /* 원본이 400x280(10:7)이다. 높이를 고정하면 열 너비에 따라 비율이 어긋나
     위아래가 잘려 나가므로, 박스 비율을 원본에 맞춰 잘림 없이 담는다.
     (디자인의 110px 보다 조금 높아지지만 사진이 온전히 보인다) */
  aspect-ratio: 10 / 7;
  height: auto;
  object-fit: cover;
  display: block;
  background: #f2f2f0;
`;

const SafetyTexts = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 12px 12px;
`;

const SafetyLabel = styled.p`
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #222;
`;

const SafetyDesc = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;

const SummaryBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
`;

const SummaryRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
`;

const SummaryLabel = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const SummaryValue = styled.span`
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  word-break: break-word;
  color: ${(props) => (props.$muted ? "#919191" : "#222")};
`;

/**
 * 운송 보험 및 유의사항 — 접수 화면의 다크 안내 패널과 같은 형태.
 * 카드가 아니라 패널이라 헤더 구분선 없이 아이콘 + 목록으로만 구성한다.
 */
const InfoPanel = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 24px;
  background: #313131;
  border-radius: var(--radius-card);
`;

const InfoIcon = styled.img`
  flex-shrink: 0;
  width: 15.833px;
  height: 15.833px;
`;

const InfoBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const InfoTitle = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #fff;
`;

const InfoList = styled.ul`
  margin: 0;
  padding: 12px 0 0 16.5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoListItem = styled.li`
  font-size: 11px;
  line-height: 17.875px;
  color: rgba(255, 255, 255, 0.5);
  list-style: disc;
`;

const Button = styled.button`
  min-width: 60px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: #1f2937;
  color: #fff;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function ChevronIcon({ wrapper: Wrapper = ChevronWrap }) {
  return (
    <Wrapper>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="#6B7280"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Wrapper>
  );
}

export default function AS_PickupReservation() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  // 712에서 asNo 를 들고 넘어온다
  const asNo = location.state?.asNo;

  // 명세 4-1: 접수 건 요약 + 회원 연락처 기본값
  const { data: form, error: formError } = useApiQuery(
    () => (asNo ? pickup.getForm(asNo) : Promise.reject(new Error("접수 번호가 없습니다."))),
    [asNo],
  );

  const receiptInfo = {
    productName: form?.modelName ?? "—",
    receiptNumber: form?.asNo ?? asNo ?? "—",
    status: form?.statusLabel ?? "—",
    // 명세 4-1 의 photoUrl — 접수 시 올린 제품 사진
    photoUrl: form?.photoUrl,
  };

  const minSelectableDate = useMemo(() => getTomorrow(), []);

  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [note, setNote] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date(minSelectableDate.getFullYear(), minSelectableDate.getMonth(), 1),
  );

  const dateFieldRef = useRef(null);

  useEffect(() => {
    if (!calendarOpen) return;

    function handleClickOutside(e) {
      if (dateFieldRef.current && !dateFieldRef.current.contains(e.target)) {
        setCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  // 명세 4-1: phone 은 회원 연락처 기본값. 사용자가 아직 손대지 않았을 때만 채운다.
  useEffect(() => {
    if (form?.phone) setPhone((prev) => (prev ? prev : formatPhoneNumber(form.phone)));
  }, [form]);

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  // 명세 4-2: 예약 가능 슬롯. startDate 생략 시 오늘, endDate 생략 시 +14일
  const { data: slotData } = useApiQuery(() => pickup.getSlots(), []);

  const availableDateSet = new Set(
    (slotData?.dateList ?? [])
      .filter((entry) => entry.slotList.some((slot) => slot.available))
      .map((entry) => entry.date),
  );

  const selectedDateKey = pickupDate ? toDateKey(pickupDate) : null;
  const timeSlots = (slotData?.dateList ?? []).find((entry) => entry.date === selectedDateKey)
    ?.slotList ?? [];

  const selectedTimeSlot = timeSlots.find((slot) => slot.slotStart === pickupTime);

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (date) => {
    if (!date || date < minSelectableDate || !availableDateSet.has(toDateKey(date))) return;
    setPickupDate(date);
    setPickupTime("");
    setCalendarOpen(false);
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(formatPhoneNumber(digits));
  };

  const phoneDigits = phone.replace(/\D/g, "");
  // 픽업 날짜 · 픽업 시간대 · 수거 주소가 모두 채워지면 '예약 확정하기'가 활성화된다.
  // 전화번호는 GET /pickup/form 의 회원 연락처로 미리 채워지므로 활성화 조건에서 제외한다.
  const isFormValid = !!pickupDate && !!pickupTime && address.trim() !== "" && !submitting;

  // 명세 4-3: 예약 확정. slotEnd 는 서버가 슬롯 마스터에서 가져오므로 보내지 않는다.
  const handleConfirm = async () => {
    if (!isFormValid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { pickupNo } = await pickup.create(asNo, {
        pickupDate: toDateKey(pickupDate),
        slotStart: pickupTime,
        phone: phoneDigits,
        address: address.trim(),
        addressDetail: addressDetail.trim(),
        note: note.trim(),
      });
      navigate("/reservation-complete", { state: { pickupNo } });
    } catch (err) {
      setSubmitError(t(PICKUP_ERRORS[err.code] || toErrorMessage(err, "예약에 실패했습니다.")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Page>
      <Body>
          <BackLink type="button" onClick={() => navigate(-1)}>
            <BackArrow src={backArrow} alt="" />
            {t("AI 예상 견적 결과")}
          </BackLink>

          <TopRow>
            <PageTitle>{t("픽업 예약")}</PageTitle>
            <StepWrap>
              <StepIndicator current={3} />
            </StepWrap>
            <TopActions>
              <Button type="button" disabled={!isFormValid || submitting} onClick={handleConfirm}>
                {submitting ? t("예약 중…") : t("예약 확정하기")}
              </Button>
            </TopActions>
          </TopRow>

          <Columns>
            <LeftColumn>
              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("접수 건 정보")}</CardHeaderInner>
                </CardHeader>
                <CardBody>
                  <ReceiptRow>
                    <Thumb>
                      {receiptInfo.photoUrl && (
                        <ThumbImage src={receiptInfo.photoUrl} alt={t("제품 사진")} />
                      )}
                    </Thumb>
                    <ReceiptTexts>
                      <ProductName>{receiptInfo.productName}</ProductName>
                      <ReceiptMeta>
                        <ReceiptNo>
                          <ReceiptNoLabel>{t("AS 접수번호:")}</ReceiptNoLabel>
                          <ReceiptNoValue>{receiptInfo.receiptNumber}</ReceiptNoValue>
                        </ReceiptNo>
                        <StatusRow>
                          <StatusDot />
                          <StatusText>{t(receiptInfo.status)}</StatusText>
                        </StatusRow>
                      </ReceiptMeta>
                    </ReceiptTexts>
                  </ReceiptRow>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("픽업 일시 선택")}</CardHeaderInner>
                </CardHeader>
                <CardBody>
                <FieldGrid>
                <FieldGroup ref={dateFieldRef}>
                  <FieldLabel>{t("픽업 날짜")}</FieldLabel>
                  <SelectBox
                    type="button"
                    $hasValue={!!pickupDate}
                    onClick={() => setCalendarOpen((prev) => !prev)}
                  >
                    {pickupDate ? formatDateKorean(pickupDate, t) : t("날짜 선택")}
                    <CalendarIcon src={calendarIcon} alt="" />
                  </SelectBox>

                  {calendarOpen && (
                    <CalendarPopover>
                      <CalendarHeader>
                        <CalendarNavButton type="button" onClick={handlePrevMonth}>
                          ‹
                        </CalendarNavButton>
                        <CalendarTitle>
                          {t("{year}년 {month}월", {
                            year: calendarMonth.getFullYear(),
                            month: calendarMonth.getMonth() + 1,
                          })}
                        </CalendarTitle>
                        <CalendarNavButton type="button" onClick={handleNextMonth}>
                          ›
                        </CalendarNavButton>
                      </CalendarHeader>
                      <CalendarGrid>
                        {WEEKDAYS_KO.map((day) => (
                          <CalendarWeekday key={day}>{t(day)}</CalendarWeekday>
                        ))}
                        {calendarDays.map((date, idx) => {
                          if (!date) return <div key={`blank-${idx}`} />;
                          // 명세 4-2: 예약 가능 슬롯이 하나도 없는 날짜는 선택할 수 없다
                          const disabled =
                            date < minSelectableDate || !availableDateSet.has(toDateKey(date));
                          const selected = isSameDate(date, pickupDate);
                          return (
                            <CalendarDay
                              key={date.toISOString()}
                              type="button"
                              $disabled={disabled}
                              $selected={selected}
                              disabled={disabled}
                              onClick={() => handleSelectDate(date)}
                            >
                              {date.getDate()}
                            </CalendarDay>
                          );
                        })}
                      </CalendarGrid>
                    </CalendarPopover>
                  )}
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>{t("픽업 시간대")}</FieldLabel>
                  <SelectWrapper>
                    <Select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      $hasValue={!!pickupTime}
                    >
                      <option value="" disabled hidden>
                        {t("시간대 선택")}
                      </option>
                      {timeSlots.map((slot) => (
                        <option
                          key={slot.slotStart}
                          value={slot.slotStart}
                          disabled={!slot.available}
                        >
                          {slot.slotStart} – {slot.slotEnd}
                          {slot.available ? "" : ` ${t("(마감)")}`}
                        </option>
                      ))}
                    </Select>
                    <ChevronIcon wrapper={SelectChevronWrap} />
                  </SelectWrapper>
                </FieldGroup>
                </FieldGrid>

                <FieldGroup>
                  <FieldLabel>{t("전화번호")}</FieldLabel>
                  <TextInput
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder={t("010-0000-0000")}
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                  <FieldHint>{t("기사님이 해당 전화번호로 연락을 드릴 예정입니다.")}</FieldHint>
                </FieldGroup>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("수거 장소")}</CardHeaderInner>
                </CardHeader>
                <CardBody>
                  <FieldGroup>
                    <FieldLabel>{t("주소")}</FieldLabel>
                    <TextInput
                      type="text"
                      placeholder={t("도로명 주소 검색")}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>{t("상세 주소 (동·호수 등)")}</FieldLabel>
                    <TextInput
                      type="text"
                      placeholder={t("상세 주소 입력")}
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                    />
                  </FieldGroup>
                  <FieldGroup>
                    <FieldLabel>{t("수거 시 전달 사항")}</FieldLabel>
                    <TextArea
                      placeholder={t("예: 경비실 맡겨 주세요 / 도착 전 문자 주세요")}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </FieldGroup>
                </CardBody>
              </Card>

              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("안전 인계 안내")}</CardHeaderInner>
                </CardHeader>
                <CardBody>
                  <SafetyGrid>
                    {SAFETY_ITEMS.map((item) => (
                      <SafetyItem key={item.label}>
                        <SafetyImage src={item.image} alt="" />
                        <SafetyTexts>
                          <SafetyLabel>{t(item.label)}</SafetyLabel>
                          <SafetyDesc>{t(item.desc)}</SafetyDesc>
                        </SafetyTexts>
                      </SafetyItem>
                    ))}
                  </SafetyGrid>
                </CardBody>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("예약 정보 확인")}</CardHeaderInner>
                </CardHeader>
                <SummaryBody>
                  <SummaryRow>
                    <SummaryLabel>{t("접수 번호")}</SummaryLabel>
                    <SummaryValue>{receiptInfo.receiptNumber}</SummaryValue>
                  </SummaryRow>
                  <SummaryRow>
                    <SummaryLabel>{t("제품명")}</SummaryLabel>
                    <SummaryValue>{receiptInfo.productName}</SummaryValue>
                  </SummaryRow>
                  <SummaryRow>
                    <SummaryLabel>{t("픽업 날짜")}</SummaryLabel>
                    <SummaryValue $muted={!pickupDate}>
                      {pickupDate ? formatDateKorean(pickupDate, t) : "—"}
                    </SummaryValue>
                  </SummaryRow>
                  <SummaryRow>
                    <SummaryLabel>{t("픽업 시간대")}</SummaryLabel>
                    <SummaryValue $muted={!selectedTimeSlot}>
                      {selectedTimeSlot
                        ? `${selectedTimeSlot.slotStart} – ${selectedTimeSlot.slotEnd}`
                        : "—"}
                    </SummaryValue>
                  </SummaryRow>
                  <SummaryRow $last>
                    <SummaryLabel>{t("수거 주소")}</SummaryLabel>
                    <SummaryValue $muted={!address.trim()}>
                      {address.trim() ? address : "—"}
                    </SummaryValue>
                  </SummaryRow>
                </SummaryBody>
              </Card>

              <InfoPanel>
                <InfoIcon src={infoIcon} alt="" />
                <InfoBody>
                  <InfoTitle>{t("운송 보험 및 유의사항")}</InfoTitle>
                  <InfoList>
                    {INSURANCE_NOTES.map((note) => (
                      <InfoListItem key={note}>{t(note)}</InfoListItem>
                    ))}
                  </InfoList>
                </InfoBody>
              </InfoPanel>

              {(submitError || formError) && (
                <SubmitError role="alert">{submitError || t(toErrorMessage(formError))}</SubmitError>
              )}
            </RightColumn>
          </Columns>
      </Body>
    </Page>
  );
}
