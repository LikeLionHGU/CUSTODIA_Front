import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

const SAFETY_ITEMS = [
  { label: "기사 신원 확인" },
  { label: "인계 전후 사진 기록" },
  { label: "고객·기사 전자서명" },
  { label: "운송 보험 자동 적용" },
];

function pad(n) {
  return String(n).padStart(2, "0");
}

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

function formatDateKorean(date) {
  if (!date) return "";
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS_KO[date.getDay()]})`;
}

function to12Hour(hour, minute) {
  const period = hour < 12 ? "오전" : "오후";
  const h12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${period} ${h12}:${pad(minute)}`;
}

function generateTimeSlots() {
  const slots = [];
  const startMinutes = 9 * 60;
  const endMinutes = 18 * 60;
  for (let m = startMinutes; m + 30 <= endMinutes; m += 30) {
    const startH = Math.floor(m / 60);
    const startM = m % 60;
    const endTotal = m + 30;
    const endH = Math.floor(endTotal / 60);
    const endM = endTotal % 60;
    const value = `${pad(startH)}:${pad(startM)}-${pad(endH)}:${pad(endM)}`;
    const label = `${to12Hour(startH, startM)} - ${to12Hour(endH, endM)}`;
    slots.push({ value, label });
  }
  return slots;
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

const TIME_SLOTS = generateTimeSlots();

const Page = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  box-sizing: border-box;
  text-align: left;
`;

const BodyRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
`;

const Body = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
  box-sizing: border-box;
`;

const SectionTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
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
  gap: 16px;
`;

const RightColumn = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Card = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const CardTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
`;

const CardText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const InfoRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

const InfoImage = styled.div`
  flex: 1 0 0;
  height: 72px;
  min-width: 48px;
  min-height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  font-size: 11px;
  color: #9ca3af;
`;

const InfoTextGroup = styled.div`
  flex: 1 0 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

const InfoSubText = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const FieldGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;
`;

const FieldLabel = styled.label`
  font-size: 14px;
  color: #1f2937;
`;

const TextInput = styled.input`
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #1f2937;

  &::placeholder {
    color: #9ca3af;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  height: 80px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: #1f2937;
  resize: vertical;
  font-family: inherit;
`;

const SelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Select = styled.select`
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 8px 32px 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  color: ${(props) => (props.$hasValue ? "#1f2937" : "#9ca3af")};
  appearance: none;
`;

const SelectBox = styled.button`
  width: 100%;
  height: 38px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  font-size: 14px;
  text-align: left;
  color: ${(props) => (props.$hasValue ? "#1f2937" : "#9ca3af")};
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
`;

const ChevronWrap = styled.span`
  display: flex;
  flex-shrink: 0;
  pointer-events: none;
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
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
`;

const SafetyImage = styled.div`
  width: 100%;
  height: 56px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  font-size: 11px;
  color: #9ca3af;
`;

const SafetyLabel = styled.p`
  margin: 0;
  font-size: 11px;
  color: #1f2937;
`;

const SummaryRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: #1f2937;
`;

const SummaryLabel = styled.span`
  color: #1f2937;
`;

const SummaryValue = styled.span`
  color: #1f2937;
  text-align: right;
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
  const navigate = useNavigate();
  const location = useLocation();

  const receiptInfo = location.state?.receiptInfo || {
    productName: "MCM 클래식 백팩 미디엄",
    receiptNumber: "MCM-2024-008431",
    status: "견적 안내 완료",
  };

  const minSelectableDate = useMemo(() => getTomorrow(), []);

  const [pickupDate, setPickupDate] = useState(null);
  const [pickupTime, setPickupTime] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [note, setNote] = useState("");
  const [calendarOpen, setCalendarOpen] = useState(false);
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

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);
  const selectedTimeSlot = TIME_SLOTS.find((slot) => slot.value === pickupTime);

  const handlePrevMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleSelectDate = (date) => {
    if (!date || date < minSelectableDate) return;
    setPickupDate(date);
    setCalendarOpen(false);
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 11);
    setPhone(formatPhoneNumber(digits));
  };

  const phoneDigits = phone.replace(/\D/g, "");
  const isFormValid = !!pickupDate && !!pickupTime && phoneDigits.length >= 10 && address.trim() !== "";

  const handleConfirm = () => {
    if (!isFormValid) return;

    const reservationNumber = `PKP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 900000) + 100000)}`;
    const pickupSchedule = `${formatDateKorean(pickupDate)} ${selectedTimeSlot?.label ?? ""}`;
    const addressText = [address.trim(), addressDetail.trim()].filter(Boolean).join(" ");

    navigate("/reservation-complete", {
      state: {
        reservationNumber,
        productName: receiptInfo.productName,
        pickupSchedule,
        address: addressText,
        phone,
        note: note.trim(),
      },
    });
  };

  return (
    <Page>
      <BodyRow>
        <Body>
          <SectionTitle>픽업 예약</SectionTitle>

          <Columns>
            <LeftColumn>
              <Card>
                <CardTitle>접수 건 정보</CardTitle>
                <InfoRow>
                  <InfoImage>Image</InfoImage>
                  <InfoTextGroup>
                    <InfoText>{receiptInfo.productName}</InfoText>
                    <InfoSubText>AS 접수번호: {receiptInfo.receiptNumber}</InfoSubText>
                    <InfoSubText>접수 상태: {receiptInfo.status}</InfoSubText>
                  </InfoTextGroup>
                </InfoRow>
              </Card>

              <Card>
                <CardTitle>픽업 일시 선택</CardTitle>

                <FieldGroup ref={dateFieldRef}>
                  <FieldLabel>픽업 날짜</FieldLabel>
                  <SelectBox
                    type="button"
                    $hasValue={!!pickupDate}
                    onClick={() => setCalendarOpen((prev) => !prev)}
                  >
                    {pickupDate ? formatDateKorean(pickupDate) : "날짜 선택"}
                    <ChevronIcon />
                  </SelectBox>

                  {calendarOpen && (
                    <CalendarPopover>
                      <CalendarHeader>
                        <CalendarNavButton type="button" onClick={handlePrevMonth}>
                          ‹
                        </CalendarNavButton>
                        <CalendarTitle>
                          {calendarMonth.getFullYear()}년 {calendarMonth.getMonth() + 1}월
                        </CalendarTitle>
                        <CalendarNavButton type="button" onClick={handleNextMonth}>
                          ›
                        </CalendarNavButton>
                      </CalendarHeader>
                      <CalendarGrid>
                        {WEEKDAYS_KO.map((day) => (
                          <CalendarWeekday key={day}>{day}</CalendarWeekday>
                        ))}
                        {calendarDays.map((date, idx) => {
                          if (!date) return <div key={`blank-${idx}`} />;
                          const disabled = date < minSelectableDate;
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
                  <FieldLabel>픽업 시간대</FieldLabel>
                  <SelectWrapper>
                    <Select
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      $hasValue={!!pickupTime}
                    >
                      <option value="" disabled hidden>
                        시간대 선택
                      </option>
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot.value} value={slot.value}>
                          {slot.label}
                        </option>
                      ))}
                    </Select>
                    <ChevronIcon wrapper={SelectChevronWrap} />
                  </SelectWrapper>
                </FieldGroup>

                <FieldGroup>
                  <FieldLabel>전화번호</FieldLabel>
                  <TextInput
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="숫자만 입력해 주세요"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </FieldGroup>
                <InfoSubText>기사님이 해당 전화번호로 연락을 드릴 예정입니다.</InfoSubText>
              </Card>

              <Card>
                <CardTitle>수거 장소</CardTitle>
                <FieldGroup>
                  <FieldLabel>주소</FieldLabel>
                  <TextInput type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>상세 주소 (동·호수 등)</FieldLabel>
                  <TextInput
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                  />
                </FieldGroup>
                <FieldGroup>
                  <FieldLabel>수거 시 전달 사항</FieldLabel>
                  <TextArea value={note} onChange={(e) => setNote(e.target.value)} />
                </FieldGroup>
              </Card>

              <Card>
                <CardTitle>안전 인계 안내</CardTitle>
                <SafetyGrid>
                  {SAFETY_ITEMS.map((item) => (
                    <SafetyItem key={item.label}>
                      <SafetyImage>Image</SafetyImage>
                      <SafetyLabel>{item.label}</SafetyLabel>
                    </SafetyItem>
                  ))}
                </SafetyGrid>
                <InfoSubText>
                  픽업 기사는 신원 확인된 MCM 케어 파트너 기사입니다. 인계 전후 제품 상태 사진과 전자서명이 접수
                  건에 자동으로 기록됩니다.
                </InfoSubText>
              </Card>
            </LeftColumn>

            <RightColumn>
              <Card>
                <CardTitle>예약 정보 확인</CardTitle>
                <SummaryRow>
                  <SummaryLabel>접수 번호</SummaryLabel>
                  <SummaryValue>{receiptInfo.receiptNumber}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>제품명</SummaryLabel>
                  <SummaryValue>{receiptInfo.productName}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>픽업 날짜</SummaryLabel>
                  <SummaryValue>{pickupDate ? formatDateKorean(pickupDate) : "-"}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>픽업 시간대</SummaryLabel>
                  <SummaryValue>{selectedTimeSlot ? selectedTimeSlot.label : "-"}</SummaryValue>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>수거 주소</SummaryLabel>
                  <SummaryValue>{address.trim() ? address : "-"}</SummaryValue>
                </SummaryRow>
              </Card>

              <Card>
                <CardTitle>운송 보험 및 유의사항</CardTitle>
                <CardText>
                  본 픽업 서비스에는 운송 보험이 자동 적용됩니다. 인계 시점부터 MCM 케어 수선센터 도착까지 제품이
                  보호됩니다.
                </CardText>
                <CardText>예약 확정 후 취소는 픽업 예정일 24시간 전까지 가능합니다.</CardText>
                <CardText>최종 수선 비용은 실물 진단 후 별도 안내됩니다. 예상 견적은 참고용입니다.</CardText>
              </Card>

              <Button type="button" disabled={!isFormValid} onClick={handleConfirm}>
                예약 확정
              </Button>
            </RightColumn>
          </Columns>
        </Body>
      </BodyRow>
    </Page>
  );
}
