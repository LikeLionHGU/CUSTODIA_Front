import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import StepIndicator from "../components/StepIndicator";
import * as pickup from "../api/pickup";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, formatWon, toErrorMessage } from "../api/format";
import backArrow from "../assets/icon_back_arrow.svg";
import checkIcon from "../assets/icon_step_check.svg";
import { useT } from "../i18n";
import { reveal } from "../css/motion";

const WEEKDAYS_KO = ["일", "월", "화", "수", "목", "금", "토"];

const PREPARATION_NOTES = [
  "제품을 원래 포장재 또는 완충재로 감싸 준비해 주세요.",
  "기사 도착 시 신분증을 확인하실 수 있습니다.",
  "인계 직후 제품 상태 사진 촬영과 전자서명이 진행됩니다.",
  "픽업 당일 방문 전 문자 알림이 발송됩니다.",
];

const INSURANCE_NOTE =
  "운송 중 발생하는 분실·파손에 대해 보험이 적용됩니다. 인계 전후 제품 상태 사진과 전자서명이 기록되어 분쟁 발생 시 참고 자료로 활용됩니다.";

/** `2025-06-18` + 슬롯 → `2025년 6월 18일 (수) 10:00 – 12:00` (요일·날짜는 언어를 따른다) */
function formatSchedule(data, t) {
  if (!data?.pickupDate) return "—";

  const [year, month, day] = data.pickupDate.split("-").map(Number);
  const weekday = t(WEEKDAYS_KO[new Date(year, month - 1, day).getDay()]);
  const time = [data.slotStart, data.slotEnd].filter(Boolean).join(" – ");
  return `${formatKoreanDate(data.pickupDate)} (${weekday}) ${time}`.trim();
}

export default function AS_ReservationComplete() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  // 720에서 예약 확정 후 pickupNo 를 들고 넘어온다
  const pickupNo = location.state?.pickupNo;

  const { data, loading, error } = useApiQuery(
    () =>
      pickupNo ? pickup.getComplete(pickupNo) : Promise.reject(new Error("예약 번호가 없습니다.")),
    [pickupNo],
  );

  const reservationRows = [
    { label: "예약 번호", value: data?.pickupNo ?? pickupNo ?? "—" },
    { label: "픽업 일정", value: formatSchedule(data, t) },
    {
      label: "수거 장소",
      value: data ? [data.address, data.addressDetail].filter(Boolean).join(", ") : "—",
    },
    {
      // 명세 4-4: 예약 확정 시 자동 배정되므로 실제 배정된 기사 정보를 표시한다
      label: "담당 기사",
      value: data?.driverName
        ? [data.driverName, data.driverAffiliation].filter(Boolean).join(" · ")
        : "배차 확인 중",
    },
  ];

  const insuranceRows = [
    { label: "보험 적용", value: data?.insuranceApplied ? "적용됨" : "미적용" },
    {
      label: "보상 한도",
      // 한국어는 "만 원" 단위, 다른 언어는 전체 금액을 쓰므로 두 값을 모두 넘긴다
      value: data?.insuranceLimit
        ? t("최대 {man}만 원", {
            man: (data.insuranceLimit / 10000).toLocaleString("ko-KR"),
            amount: formatWon(data.insuranceLimit),
          })
        : "—",
    },
  ];

  return (
    <Page>
      <Body>
        <BackLink type="button" onClick={() => navigate(-1)}>
          <BackArrow src={backArrow} alt="" />
          {t("픽업 예약")}
        </BackLink>

        <TopRow>
          <PageTitle>{t("픽업 예약 완료")}</PageTitle>
          <StepWrap>
            <StepIndicator current={4} />
          </StepWrap>
          <TopActions>
            <Button type="button" onClick={() => navigate("/my-as-list")}>
              {t("확인")}
            </Button>
          </TopActions>
        </TopRow>

        {loading && <StateBanner>{t("예약 정보를 불러오는 중…")}</StateBanner>}
        {!loading && error && <StateBanner role="alert">{t(toErrorMessage(error))}</StateBanner>}

        <ConfirmBanner>
          <ConfirmIconWrap>
            <ConfirmIcon src={checkIcon} alt="" />
          </ConfirmIconWrap>
          <ConfirmTexts>
            <ConfirmTitle>{t("예약이 확정되었습니다")}</ConfirmTitle>
            <ConfirmDescription>
              {t(
                "신원 확인된 기사가 지정하신 일정에 방문합니다. 방문 전 제품을 준비해 두시면 인계가 원활하게 진행됩니다.",
              )}
            </ConfirmDescription>
          </ConfirmTexts>
        </ConfirmBanner>

        <Columns $pending={loading}>
          <Card>
            <CardHeader>
              <CardHeaderInner>{t("예약 정보 확인")}</CardHeaderInner>
            </CardHeader>
            <CardBody>
              {reservationRows.map((row, index) => (
                <DataRow key={row.label} $divider={index < reservationRows.length - 1}>
                  <DataLabel>{t(row.label)}</DataLabel>
                  <DataValue>{t(row.value)}</DataValue>
                </DataRow>
              ))}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardHeaderInner>{t("운송 보험 안내")}</CardHeaderInner>
            </CardHeader>
            <CardBody>
              {insuranceRows.map((row) => (
                <DataRow key={row.label} $divider>
                  <DataLabel>{t(row.label)}</DataLabel>
                  <DataValue>{t(row.value)}</DataValue>
                </DataRow>
              ))}
              <InsuranceNote>{t(INSURANCE_NOTE)}</InsuranceNote>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardHeaderInner>{t("기사 방문 전 준비 사항")}</CardHeaderInner>
            </CardHeader>
            <CardBody>
              <NoteList>
                {PREPARATION_NOTES.map((note) => (
                  <NoteItem key={note}>{t(note)}</NoteItem>
                ))}
              </NoteList>
            </CardBody>
          </Card>
        </Columns>
      </Body>
    </Page>
  );
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
  max-width: 1441px;
  margin: 0 auto;
  padding: 27px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
 * 제목 · 단계 표시 · 액션 버튼.
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

const StateBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 16px;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 13px;
  line-height: 19.5px;
  color: #313131;
`;

const ConfirmBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding: 28px 32px;
  background: #222;
  border-radius: 8px;
`;

const ConfirmIconWrap = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #fff;
  border-radius: 999px;
  box-sizing: border-box;
`;

const ConfirmIcon = styled.img`
  width: 18px;
  height: 18px;
`;

const ConfirmTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ConfirmTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 30px;
  color: #fff;
`;

const ConfirmDescription = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.6);
`;

const Columns = styled.div`
  ${reveal}
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 27px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 24px;
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
  border-radius: 8px;
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
  align-items: flex-start;
  gap: 12px;
  padding: 20px 24px;
`;

const DataRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 8px 0;
  border-bottom: ${(props) => (props.$divider ? "1px solid #d1d5db" : "none")};
`;

const DataLabel = styled.p`
  flex-shrink: 0;
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const DataValue = styled.p`
  min-width: 0;
  margin: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  color: #222;
`;

const InsuranceNote = styled.p`
  width: 100%;
  margin: 0;
  padding: 16px 0;
  box-sizing: border-box;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;

const NoteList = styled.ol`
  width: 100%;
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const NoteItem = styled.li`
  padding: 8px 0;
  font-size: 12px;
  line-height: 18px;
  color: #919191;
`;
