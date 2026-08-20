import { useLocation, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";

import Button from "../components/Button";
import sampleProductImage from "../assets/product_stark_backpack.avif";
import StatusLabel from "../components/StatusLabel";
import * as asCaseApi from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatDotDate, formatKoreanDate, toErrorMessage } from "../api/format";
import { resolvePhotoUrl } from "../api/photo";
import { reveal } from "../css/motion";
import { useT } from "../i18n";

const LOCATION_NOTICE = {
  title: "정보 미확정 안내",
  body: "수선 업체 내부 일정에 따라 세부 위치 정보가 일부 제공되지 않을 수 있습니다. 갱신 시 즉시 반영됩니다.",
};

/**
 * 접수번호 없이 이 주소로 바로 들어왔을 때 쓰는 표본 데이터 (디자인 616:13032 의 내용).
 *
 * 접수번호가 있으면 서버 응답만 쓴다 — 조회가 실패했는데 표본으로 덮으면
 * 실제 접수 건의 값처럼 보여 오해를 만든다.
 */
const SAMPLE_DETAIL = {
  asNo: "MCM-2024-009341",
  modelName: "MCM 클래식 백팩",
  photoUrlList: [sampleProductImage],
  createdAt: "2024-11-12",
  intakeType: "픽업 수거 접수",
  status: "REPAIRING",
  statusLabel: "수선중",
  expectedCompletedAt: "2024-12-03",
  statusUpdatedAt: "2024-11-20",
  currentLocation: "MCM 서울 수선 센터",
  locationStatus: "수선 작업 중",
  historyList: [
    {
      status: "RECEIVED",
      statusLabel: "접수 완료",
      occurredAt: "2024-11-12",
      description: "픽업 예약 후 제품 수거 완료",
      completed: true,
    },
    {
      status: "PICKED_UP",
      statusLabel: "픽업 완료",
      occurredAt: "2024-11-12",
      description: "픽업 예약 후 제품 수거 완료",
      completed: true,
    },
    {
      status: "DIAGNOSED",
      statusLabel: "손상 부위 진단 완료",
      occurredAt: "2024-11-14",
      description: "제품 상태 및 손상 부위 사진 기록 완료",
      completed: true,
    },
    {
      status: "REPAIRING",
      statusLabel: "수선 진행 중",
      occurredAt: "2024-11-18",
      description: "MCM 서울 수선 센터에서 작업 중",
      completed: true,
    },
    {
      status: "INSPECTING",
      statusLabel: "품질 검수",
      occurredAt: null,
      description: "수선 완료 후 품질 기준 최종 점검",
      completed: false,
    },
    {
      status: "SHIPPING",
      statusLabel: "발송",
      occurredAt: null,
      description: "검수 완료 후 고객 배송 진행",
      completed: false,
    },
  ],
};

export default function AS_MyDetail() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  const asNo = location.state?.asNo;

  const { data: fetched, loading, error } = useApiQuery(
    () => (asNo ? asCaseApi.getDetail(asNo) : Promise.resolve(null)),
    [asNo],
  );

  // 접수번호를 들고 들어왔으면 서버 응답만, 아니면 표본을 보여 준다
  const data = asNo ? fetched : SAMPLE_DETAIL;

  const historyList = data?.historyList ?? [];
  // 완료된 단계 중 마지막이 현재 단계다
  const currentIndex = historyList.reduce((last, step, i) => (step.completed ? i : last), -1);

  // 접수 시 올린 제품 사진. 응답이 어떤 필드 이름을 쓰든 찾아 온다.
  const photoUrl = resolvePhotoUrl(data);

  const handleGoToList = () => navigate("/my-as-list");

  /**
   * 이 접수 건의 AI 견적을 다시 본다 — 접수 흐름이 아니라 조회이므로 review 로 표시한다.
   * 표본을 보여 주는 중이면 접수번호를 넘기지 않는다. 넘기면 견적 화면이 없는 건을
   * 조회하다 실패한다 — 그쪽도 접수번호가 없으면 표본을 보여 준다.
   */
  const handleReviewEstimate = () => {
    navigate("/ai-estimate", { state: { asNo: asNo ? (data?.asNo ?? asNo) : undefined, review: true } });
  };

  // 명세 3-6: 이 버튼은 POST /api/chat 에 asNo 를 담아 호출한다
  const handleConsult = () => {
    navigate("/ai-concierge", {
      state: {
        asNo: asNo ? (data?.asNo ?? asNo) : undefined,
        modelName: data?.modelName,
        statusLabel: data?.statusLabel,
      },
    });
  };

  return (
    <Page>
      <Body>
        <BackLink type="button" onClick={handleGoToList}>
          {t("A/S 조회")}
        </BackLink>

        <TopRow>
          <PageTitle>{t("A/S 조회 상세")}</PageTitle>
          <Button type="button" onClick={handleReviewEstimate} disabled={!data}>
            {t("해당 제품 AI 견적 다시보기")}
          </Button>
        </TopRow>

        {loading && <StateText>{t("불러오는 중…")}</StateText>}
        {!loading && error && <StateText role="alert">{t(toErrorMessage(error))}</StateText>}

        <Columns $pending={loading}>
          {/* 왼쪽 묶음 — 식별 정보 + 일정·위치, 그 아래 상담 배너 */}
          <MainGroup>
            <Cards>
              <Card>
                <CardHeader>
                  <CardHeaderInner>{t("접수 건 식별 정보")}</CardHeaderInner>
                </CardHeader>
                <Photo>{photoUrl && <PhotoImg src={photoUrl} alt={t("제품 사진")} />}</Photo>
                <CardBody>
                  <Row>
                    <Key>{t("AS 번호")}</Key>
                    <Val>{data?.asNo ?? asNo ?? "—"}</Val>
                  </Row>
                  <Row>
                    <Key>{t("제품명")}</Key>
                    <Val>{data?.modelName ?? "—"}</Val>
                  </Row>
                  <Row>
                    <Key>{t("접수일")}</Key>
                    <Val>{data?.createdAt ? formatKoreanDate(data.createdAt) : "—"}</Val>
                  </Row>
                  <Row>
                    <Key>{t("접수 유형")}</Key>
                    <Val>{t(data?.intakeType) ?? "—"}</Val>
                  </Row>
                  <Row $last>
                    <Key>{t("현재 단계")}</Key>
                    {/* 상태 색은 StatusLabel 이 정한다 — 목록·홈과 같은 색을 쓰게 된다 */}
                    <StatusLabel status={data?.status} label={data?.statusLabel} />
                  </Row>
                </CardBody>
              </Card>

              <SideStack>
                <Card>
                  <CardHeader>
                    <CardHeaderInner>{t("예상 완료일")}</CardHeaderInner>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Key>{t("예상 완료일")}</Key>
                      <Val>
                        {data?.expectedCompletedAt ? formatKoreanDate(data.expectedCompletedAt) : "—"}
                      </Val>
                    </Row>
                    <Row $last>
                      <Key>{t("최종 갱신")}</Key>
                      <Val>
                        {/* 서버는 상태가 바뀐 시각을 statusUpdatedAt 으로 준다 */}
                        {data?.statusUpdatedAt ? formatKoreanDate(data.statusUpdatedAt) : "—"}
                      </Val>
                    </Row>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardHeaderInner>{t("위치 및 현황")}</CardHeaderInner>
                  </CardHeader>
                  <CardBody>
                    <Row>
                      <Key>{t("현재 위치")}</Key>
                      <Val>{t(data?.currentLocation) ?? "—"}</Val>
                    </Row>
                    <Row>
                      <Key>{t("위치 상태")}</Key>
                      <Val>{t(data?.locationStatus) ?? "—"}</Val>
                    </Row>
                    <NoticeBox>
                      <NoticeTitle>{t(LOCATION_NOTICE.title)}</NoticeTitle>
                      <NoticeBody>{t(data?.delayReason ?? LOCATION_NOTICE.body)}</NoticeBody>
                    </NoticeBox>
                  </CardBody>
                </Card>
              </SideStack>
            </Cards>

            <ConsultBanner>
              <ConsultTexts>
                <ConsultTitle>{t("해당 A/S 건에 대해 궁금한 점이 있으신가요?")}</ConsultTitle>
                <ConsultDesc>
                  {t(
                    "AI 컨시어지 또는 상담원이 접수 이력과 수선 진행 기록을 공유하여 반복 설명 없이 문의를 이어갑니다.",
                  )}
                </ConsultDesc>
              </ConsultTexts>
              <ConsultButton type="button" onClick={handleConsult}>
                {t("해당 A/S 건 상담하기")}
              </ConsultButton>
            </ConsultBanner>
          </MainGroup>

          {/* 오른쪽 — 수선 진행 이력 */}
          <Card>
            <CardHeader>
              <CardHeaderInner>{t("수선 진행 이력")}</CardHeaderInner>
            </CardHeader>
            <TimelineBody>
              {historyList.length === 0 && <Key>{t("표시할 이력이 없습니다.")}</Key>}
              {historyList.map((step, index) => {
                const state =
                  index === currentIndex ? "now" : step.completed ? "done" : "next";
                return (
                  <Entry key={step.status ?? index}>
                    <Rail>
                      <Dot $state={state} />
                      {index < historyList.length - 1 && <Line />}
                    </Rail>
                    <EntryBody>
                      <EntryHead>
                        <EntryTitle $state={state}>{t(step.statusLabel)}</EntryTitle>
                        {state === "now" && <NowBadge>{t("진행중")}</NowBadge>}
                        {state === "next" && <NextBadge>{t("예정")}</NextBadge>}
                      </EntryHead>
                      <EntryDate $state={state}>
                        {step.occurredAt ? formatDotDate(step.occurredAt) : "—"}
                        {state === "now" && ` ~ ${t("현재")}`}
                      </EntryDate>
                      {step.description && (
                        <EntryDesc $state={state}>{t(step.description)}</EntryDesc>
                      )}
                    </EntryBody>
                  </Entry>
                );
              })}
            </TimelineBody>
          </Card>
        </Columns>
      </Body>
    </Page>
  );
}

/* ─────────────────────────────────────────────
   Styled Components – Figma node-id=616-13032 기준
   ───────────────────────────────────────────── */

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
  margin-bottom: 20px;
  padding: 0;
  border: none;
  background: none;
  font-size: 10px;
  line-height: 10px;
  color: #919191;
  text-transform: uppercase;
  cursor: pointer;

  &::before {
    content: "‹";
    font-size: 12px;
  }
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 36px;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const StateText = styled.p`
  margin: 0 0 16px;
  font-size: 12px;
  line-height: 18px;
  color: #6b6b65;
`;

/** 디자인의 3단 구성 — 왼쪽 묶음(882) : 이력(432) */
const Columns = styled.div`
  ${reveal}
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 882fr) minmax(0, 432fr);
  align-items: start;
  gap: 32px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`;

const MainGroup = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

/** 식별 정보(424) : 일정·위치(425) */
const Cards = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 424fr) minmax(0, 425fr);
  align-items: stretch;
  gap: 33px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

/** 일정·위치 두 카드는 왼쪽 카드 높이에 맞춰 위아래로 벌어진다 */
const SideStack = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
`;

const Card = styled.div`
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const CardHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 20px;
`;

const CardHeaderInner = styled.p`
  width: 100%;
  margin: 0;
  padding: 20px 0;
  border-bottom: 1px solid #d1d5db;
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
  padding: 20px;
`;

/** 제품 사진 자리. 사진이 없어도 카드 높이가 흔들리지 않게 상자를 남긴다. */
const Photo = styled.div`
  width: 100%;
  height: 190px;
  flex: none;
  overflow: hidden;
  background: #f2f2f0;
`;

const PhotoImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const Row = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
`;

const Key = styled.span`
  flex-shrink: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const Val = styled.span`
  min-width: 0;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  text-align: right;
  word-break: break-word;
  color: #222;
`;

const NoticeBox = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 16px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-radius: var(--radius-card);
`;

const NoticeTitle = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  line-height: 16.5px;
  color: #919191;
`;

const NoticeBody = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  color: #c4c4c4;
`;

/* ── 상담 배너 ── */

const ConsultBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px;
  background: #313131;
  border-radius: var(--radius-card);
`;

const ConsultTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConsultTitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  color: #fff;
`;

const ConsultDesc = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: rgba(255, 255, 255, 0.5);
`;

/** 어두운 배너 위라 공용 Button 의 검은 배경을 쓸 수 없다. 크기·모서리는 토큰을 따른다. */
const ConsultButton = styled.button`
  flex-shrink: 0;
  padding: 12px 24px;
  background: #fff;
  border: 1px solid #fff;
  border-radius: var(--radius-control);
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: #ededed;
    border-color: #ededed;
  }
`;

/* ── 수선 진행 이력 ── */

const TimelineBody = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 24px;
`;

const Entry = styled.div`
  display: flex;
  align-items: stretch;
  gap: 16px;
  padding-top: 12px;

  &:first-child {
    padding-top: 4px;
  }
`;

/** 점과 연결선이 놓이는 세로 레일 */
const Rail = styled.div`
  width: 20px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
`;

const Dot = styled.span`
  width: 12px;
  height: 12px;
  flex: none;
  box-sizing: border-box;
  border-radius: var(--radius-pill);

  ${(props) =>
    props.$state === "done" &&
    css`
      background: #222;
      border: 2px solid #222;
    `}
  ${(props) =>
    props.$state === "now" &&
    css`
      background: #fff;
      border: 2px solid #222;
    `}
  ${(props) =>
    props.$state === "next" &&
    css`
      background: #fff;
      border: 2px solid #c4c4c4;
    `}
`;

const Line = styled.span`
  flex: 1 1 auto;
  min-height: 24px;
  width: 1px;
  background: #c4c4c4;
`;

const EntryBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding-bottom: 4px;
`;

const EntryHead = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const EntryTitle = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  line-height: 19.5px;
  color: ${(props) => (props.$state === "next" ? "#c4c4c4" : "#222")};
`;

const NowBadge = styled.span`
  padding: 2px 8px;
  background: #222;
  border-radius: var(--radius-pill);
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 1px;
  color: #fff;
`;

const NextBadge = styled.span`
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 1px;
  color: #c4c4c4;
`;

const EntryDate = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  line-height: 16.5px;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$state === "next" ? "#ededed" : "#919191")};
`;

const EntryDesc = styled.p`
  margin: 2px 0 0;
  font-size: 12px;
  line-height: 19.5px;
  color: ${(props) => (props.$state === "next" ? "#ededed" : "#919191")};
`;
