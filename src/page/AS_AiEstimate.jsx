import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import * as asCase from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatKoreanDate, formatWon, formatWonRange, toErrorMessage } from "../api/format";
import StepIndicator from "../components/StepIndicator";
import backArrow from "../assets/icon_back_arrow.svg";
import infoIcon from "../assets/icon_info.svg";
import { useT } from "../i18n";
import { reveal } from "../css/motion";

const PHOTO_SLOTS = 3;

// API 응답에 없는 고정 안내 문구 (화면 카피)
const COST_NOTES = [
  "수선 비용은 실제 손상 범위, 부품 수급 상황, 수선 난이도에 따라 변동될 수 있습니다.",
  "최종 견적은 수선 센터 입고 후 실물 진단을 거쳐 별도로 안내해 드립니다.",
];

const FINAL_NOTES = [
  "이 견적은 AI가 사진을 분석한 참고용 견적입니다.",
  "실물 진단 후 최종 견적은 달라질 수 있으며, 최종 견적 확인 후 수선 진행 여부를 결정할 수 있습니다.",
];

export default function AS_AiEstimate() {
  const t = useT();
  const navigate = useNavigate();
  const location = useLocation();

  // 715에서 POST /asCase 로 접수한 뒤 asNo 를 들고 넘어온다 (명세 3-2)
  const asNo = location.state?.asNo;

  const { data, loading, error, reload } = useApiQuery(
    () => (asNo ? asCase.getEstimate(asNo) : Promise.reject(new Error("접수 번호가 없습니다."))),
    [asNo],
  );

  const [retrying, setRetrying] = useState(false);

  const photoUrlList = data?.photoUrlList ?? [];

  const summaryRows = [
    { label: "제품명", value: data?.modelName ?? "—" },
    { label: "접수 번호", value: data?.asNo ?? asNo ?? "—" },
    { label: "손상 부위", value: data?.damagePart ?? "—" },
  ];

  const analysisRows = [
    { label: "분류된 손상 유형", value: data?.damageCategory ?? "—" },
    { label: "손상 정도", value: data?.damageSeverity ?? "—" },
    {
      label: "분석 신뢰도",
      value: data
        ? [data.confidenceGrade, data.confidenceNote && `(${data.confidenceNote})`]
            .filter(Boolean)
            .join(" ")
        : "—",
    },
  ];

  const warrantyRows = [
    { label: "구매일", value: data?.purchasedAt ? formatKoreanDate(data.purchasedAt) : "—" },
    {
      label: "보증 기간",
      value: data?.warrantyMonths
        ? `${t("{years}년", { years: data.warrantyMonths / 12 })}${
            data.warrantyScope ? ` (${t(data.warrantyScope)})` : ""
          }`
        : "—",
    },
    { label: "보증 적용 검토 결과", value: data?.warrantyVerdictLabel ?? "—" },
  ];

  // 명세 3-4: ESTIMATE_FAILED 상태에서만 재분석이 가능하다
  const canRetry =
    data?.status === "ESTIMATE_FAILED" ||
    error?.code === "ESTIMATE_FAILED" ||
    error?.status === 502;

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await asCase.retryEstimate(asNo);
      reload();
    } catch {
      // 실패 시 아래 에러 영역이 그대로 유지된다
    } finally {
      setRetrying(false);
    }
  };

  const handlePickupReservation = () => {
    navigate("/pickup-reservation", { state: { asNo: data?.asNo ?? asNo } });
  };

  return (
    <Page>
      <Body>
        <BackLink type="button" onClick={() => navigate("/product-info")}>
          <BackArrow src={backArrow} alt="" />
          {t("제품 정보 입력으로")}
        </BackLink>

        <TopRow>
          <TopLeft>
            <PageTitle>{t("AI 예상 견적 결과")}</PageTitle>
            <StepIndicator current={2} />
          </TopLeft>

          <Button type="button" onClick={handlePickupReservation} disabled={!data}>
            {t("AS 접수 시작하기")}
          </Button>
        </TopRow>

        {loading && <StateBanner>{t("견적을 불러오는 중…")}</StateBanner>}
        {!loading && error && (
          <StateBanner>
            {t(toErrorMessage(error, "견적을 불러오지 못했습니다."))}
            {canRetry && (
              <Button type="button" onClick={handleRetry} disabled={retrying}>
                {retrying ? t("재분석 중…") : t("견적 재분석")}
              </Button>
            )}
          </StateBanner>
        )}

        <Columns $pending={loading}>
          <LeftColumn>
            <Card>
              <CardHeader>
                <CardHeaderInner>{t("제품 정보 요약")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <PhotoGrid>
                  {Array.from({ length: PHOTO_SLOTS }, (_, idx) => (
                    <PhotoSlot key={photoUrlList[idx] ?? idx}>
                      {photoUrlList[idx] && <PhotoImg src={photoUrlList[idx]} alt={t("제출 사진")} />}
                    </PhotoSlot>
                  ))}
                </PhotoGrid>
                <SummaryGrid>
                  {summaryRows.map((row) => (
                    <SummaryItem key={row.label}>
                      <SummaryLabel>{t(row.label)}</SummaryLabel>
                      <SummaryValue>{t(row.value)}</SummaryValue>
                    </SummaryItem>
                  ))}
                </SummaryGrid>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardHeaderInner>{t("예상 수선 비용 범위")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                {/* AI 가 손상을 찾지 못하면 itemList 가 비고 금액이 0이다.
                    그대로 그리면 "₩0 – ₩0" 이 나오므로 안내 문구로 대체한다. */}
                {data?.noDamageNotice ? (
                  <MutedNote>{t(data.noDamageNotice)}</MutedNote>
                ) : (
                  <>
                    <CostList>
                      {(data?.itemList ?? []).map((item, index) => (
                        <CostRow
                          key={item.repairItemName}
                          $divider={index < data.itemList.length - 1}
                        >
                          <CostLabel>{t(item.repairItemName)}</CostLabel>
                          <CostValue>
                            {/* estimatedPrice 는 손상 정도가 반영된 추정가.
                                범위만 쓰면 경미/심각이 같은 금액으로 보인다. */}
                            {item.estimatedPrice != null && (
                              <CostPrimary>{t("약 {amount}", { amount: formatWon(item.estimatedPrice) })}</CostPrimary>
                            )}
                            <CostRange>{formatWonRange(item.minPrice, item.maxPrice)}</CostRange>
                          </CostValue>
                        </CostRow>
                      ))}
                      <CostTotalWrap>
                        <CostTotal>
                          <CostTotalLabel>{t("예상 합계")}</CostTotalLabel>
                          <CostTotalValue>
                            {data?.totalEstimatedPrice != null
                              ? t("약 {amount}", { amount: formatWon(data.totalEstimatedPrice) })
                              : data
                                ? formatWonRange(data.totalMinPrice, data.totalMaxPrice)
                                : "—"}
                          </CostTotalValue>
                        </CostTotal>
                      </CostTotalWrap>
                    </CostList>

                    <MutedNote>
                      {t(
                        "위 금액은 제출하신 사진을 기반으로 한 참고용 범위입니다. 실물 진단 결과에 따라 달라질 수 있습니다.",
                      )}
                    </MutedNote>
                  </>
                )}

                <NoteBlock>
                  <NoteBlockTitle>{t("비용 산정 참고 안내")}</NoteBlockTitle>
                  {COST_NOTES.map((note) => (
                    <MutedNote key={note}>{t(note)}</MutedNote>
                  ))}
                </NoteBlock>
              </CardBody>
            </Card>
          </LeftColumn>

          <RightColumn>
            <Card>
              <CardHeader>
                <CardHeaderInner>{t("AI 손상 유형 분석")}</CardHeaderInner>
              </CardHeader>
              <CardBody $gap={0}>
                {analysisRows.map((row, index) => (
                  <AnalysisRow key={row.label} $last={index === analysisRows.length - 1}>
                    <AnalysisLabel>{t(row.label)}</AnalysisLabel>
                    <AnalysisValue>{t(row.value)}</AnalysisValue>
                  </AnalysisRow>
                ))}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardHeaderInner>{t("보증 적용 가능 여부")}</CardHeaderInner>
              </CardHeader>
              <CardBody>
                <WarrantyBox>
                  {warrantyRows.map((row) => (
                    <WarrantyRow key={row.label}>
                      <WarrantyLabel>{t(row.label)}</WarrantyLabel>
                      <WarrantyValue>{t(row.value)}</WarrantyValue>
                    </WarrantyRow>
                  ))}
                </WarrantyBox>
                <WarrantyNoteList>
                  {(data?.warrantyNoteList ?? []).map((note) => (
                    <WarrantyNoteItem key={note}>{t(note)}</WarrantyNoteItem>
                  ))}
                </WarrantyNoteList>
              </CardBody>
              <FinalNotice>
                <FinalNoticeIcon src={infoIcon} alt="" />
                <FinalNoticeBody>
                  <FinalNoticeTitle>{t("최종 견적 안내")}</FinalNoticeTitle>
                  <FinalNoticeTexts>
                    {FINAL_NOTES.map((note) => (
                      <FinalNoticeText key={note}>{t(note)}</FinalNoticeText>
                    ))}
                  </FinalNoticeTexts>
                </FinalNoticeBody>
              </FinalNotice>
            </Card>
          </RightColumn>
        </Columns>
      </Body>
    </Page>
  );
}

/* ─────────────────────────────────────────────
   Styled Components – Figma node-id=470-5664 기준
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
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 10px;
  line-height: 10px;
  color: #919191;
  text-transform: uppercase;
  cursor: pointer;

  &:hover {
    color: #6d707b;
  }
`;

const BackArrow = styled.img`
  width: 8px;
  height: 4px;
  transform: rotate(90deg);
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 32px;
`;

const TopLeft = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 147px;

  @media (max-width: 1200px) {
    gap: 32px;
  }
`;

const PageTitle = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 22px;
  font-weight: 700;
  line-height: 22px;
  color: #222;
`;










const StateBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  padding: 16px 24px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 13px;
  line-height: 19.5px;
  color: #313131;
`;

const Columns = styled.div`
  ${reveal}
  width: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: start;
  gap: 40px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
    gap: 32px;
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
  border-radius: 4px;
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
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
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
  gap: ${(props) => props.$gap ?? 20}px;
  padding: 24px;
`;

/* ── 제품 정보 요약 카드 ── */

const PhotoGrid = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const PhotoSlot = styled.div`
  flex: 1 1 0;
  min-width: 0;
  height: 0;
  padding-bottom: 46%;
  position: relative;
  overflow: hidden;
  background: #ededed;
  border-radius: 8px;
`;

const PhotoImg = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const SummaryGrid = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #ededed;
`;

const SummaryItem = styled.div`
  flex: 1 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const SummaryLabel = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 10px;
  font-weight: 500;
  line-height: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #919191;
`;

const SummaryValue = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 19.5px;
  color: #222;
`;

/* ── 예상 수선 비용 범위 카드 ── */

const CostList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const CostRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 0;
  border-bottom: ${(props) => (props.$divider ? "1px solid #ededed" : "none")};
`;

const CostLabel = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 13px;
  line-height: 19.5px;
  color: #222;
`;

/** 금액 셀 — 추정가(굵게)와 범위(작게)를 세로로 쌓는다 */
const CostValue = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
`;

const CostPrimary = styled.span`
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 13px;
  font-weight: 500;
  line-height: 19.5px;
  color: #222;
`;

const CostRange = styled.span`
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const CostTotalWrap = styled.div`
  width: 100%;
  padding-top: 8px;
`;

const CostTotal = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 12px;
  background: #f0f0f0;
  border-radius: 4px;
`;

const CostTotalLabel = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 700;
  line-height: 12px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CostTotalValue = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  color: #222;
`;

const MutedNote = styled.p`
  width: 100%;
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;

const NoteBlock = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #ededed;
`;

const NoteBlockTitle = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 11px;
  font-weight: 500;
  line-height: 16.5px;
  letter-spacing: 0.88px;
  color: #222;
`;

/* ── AI 손상 유형 분석 카드 ── */

const AnalysisRow = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
  padding: 20px 0;
  border-bottom: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
`;

const AnalysisLabel = styled.p`
  flex-shrink: 0;
  width: 120px;
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
  letter-spacing: 0.48px;
  color: #919191;
`;

const AnalysisValue = styled.p`
  min-width: 0;
  flex: 1;
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 21px;
  color: #222;
`;

/* ── 보증 적용 가능 여부 카드 ── */

const WarrantyBox = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 8px;
`;

const WarrantyRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
`;

const WarrantyLabel = styled.p`
  flex-shrink: 0;
  width: 120px;
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const WarrantyValue = styled.p`
  min-width: 0;
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #222;
`;

const WarrantyNoteList = styled.ul`
  width: 100%;
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  list-style: disc;
`;

const WarrantyNoteItem = styled.li`
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  line-height: 19.5px;
  color: #c4c4c4;
`;

/* ── 최종 견적 안내 (다크 푸터) ── */

const FinalNotice = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 24px;
  background: #313131;
`;

const FinalNoticeIcon = styled.img`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-top: 1px;
`;

const FinalNoticeBody = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const FinalNoticeTitle = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 12px;
  color: #fff;
`;

const FinalNoticeTexts = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-top: 12px;
`;

const FinalNoticeText = styled.p`
  margin: 0;
  font-family: "Noto Sans KR", "Pretendard", sans-serif;
  font-size: 11px;
  line-height: 17.875px;
  color: rgba(255, 255, 255, 0.5);
`;
