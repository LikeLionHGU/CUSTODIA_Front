import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";

import StatusLabel from "../components/StatusLabel";
import * as asCase from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatDotDate, toErrorMessage } from "../api/format";
import { resolvePhotoUrl } from "../api/photo";
import chevronDown from "../assets/icon_chevron_down.svg";
import { useLanguage } from "../i18n";
import { reveal, revealOnMount } from "../css/motion";

/** 명세 3-5: filter 는 ALL · IN_PROGRESS · COMPLETED */
const FILTERS = [
  { label: "전체", value: "ALL" },
  { label: "진행 중", value: "IN_PROGRESS" },
  { label: "완료", value: "COMPLETED" },
];

const PAGE_SIZE = 20;

/** 목록 표의 열 정의. 헤더와 본문 행이 같은 grid-template 을 공유한다. */
const COLUMNS = ["제품 정보", "접수 번호", "상태", "일정", "갱신일"];

/**
 * 명세 3-5: 진행 중은 expectedCompletedAt, 완료된 건은 completedAt 을 보여주고
 * 화면 라벨도 "예상 완료" / "완료일" 로 달라진다.
 */
function formatSchedule(item, t) {
  if (item.completedAt) return t("완료일 {date}", { date: formatDotDate(item.completedAt) });
  if (item.expectedCompletedAt) {
    return t("예상 완료 {date}", { date: formatDotDate(item.expectedCompletedAt) });
  }
  return "—";
}

export default function AS_MyList() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("ALL");
  const [page, setPage] = useState(0);

  // 선택된 필터 버튼 위로 인디케이터를 옮기기 위한 위치값.
  // 버튼마다 글자 폭이 달라서 고정 비율 대신 실제 위치를 재서 옮긴다.
  const filterRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });

  useEffect(() => {
    const target = filterRefs.current[filter];
    if (target) setIndicator({ left: target.offsetLeft, width: target.offsetWidth });
  }, [filter, lang]);

  const { data, loading, error } = useApiQuery(
    () => asCase.getList({ filter, page, size: PAGE_SIZE }),
    [filter, page],
  );

  const itemList = data?.itemList ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleFilterChange = (value) => {
    setFilter(value);
    setPage(0); // 필터가 바뀌면 첫 페이지로 되돌린다
  };

  return (
    <Page>
      <Body>
        <TopRow>
          <PageTitle>{t("A/S 조회")}</PageTitle>
          <FilterGroup>
            <FilterIndicator
              style={{ transform: `translateX(${indicator.left}px)`, width: indicator.width }}
              aria-hidden
            />
            {FILTERS.map((item) => (
              <FilterButton
                key={item.value}
                ref={(el) => {
                  filterRefs.current[item.value] = el;
                }}
                type="button"
                $active={filter === item.value}
                onClick={() => handleFilterChange(item.value)}
              >
                {t(item.label)}
              </FilterButton>
            ))}
          </FilterGroup>
        </TopRow>

        {/* 나의 AS 현황 — 진행 중 / 완료 / 최근 갱신 3분할 */}
        <Card>
          <CardHeader>
            <CardHeaderInner>{t("나의 AS 현황")}</CardHeaderInner>
          </CardHeader>
          <SummaryGrid>
            <SummaryCell>
              <SummaryLabel>{t("진행 중")}</SummaryLabel>
              <SummaryValue $pending={loading}>{data ? t("{count}건", { count: data.inProgressCount }) : "—"}</SummaryValue>
              <SummaryNote>{t("픽업 예약 포함")}</SummaryNote>
            </SummaryCell>
            <SummaryCell>
              <SummaryLabel>{t("완료")}</SummaryLabel>
              <SummaryValue $pending={loading}>{data ? t("{count}건", { count: data.completedCount }) : "—"}</SummaryValue>
              <SummaryNote>{t("누적 완료 건수")}</SummaryNote>
            </SummaryCell>
            <SummaryCell $last>
              <SummaryLabel>{t("최근 갱신")}</SummaryLabel>
              <SummaryValue $pending={loading}>
                {data?.lastUpdatedAt ? formatDotDate(data.lastUpdatedAt) : "—"}
              </SummaryValue>
              <SummaryNote>{t("마지막 상태 업데이트")}</SummaryNote>
            </SummaryCell>
          </SummaryGrid>
        </Card>

        {/* 접수 건 목록 */}
        <Card>
          <CardHeader>
            <CardHeaderInner>
              {t("접수 건 목록")}
              <TotalCount>{data ? t("총 {count}건", { count: data.totalElements }) : ""}</TotalCount>
            </CardHeaderInner>
          </CardHeader>

          <TableHeader>
            <HeaderCell aria-hidden />
            {COLUMNS.map((column) => (
              <HeaderCell key={column}>{t(column)}</HeaderCell>
            ))}
            <HeaderCell aria-hidden />
          </TableHeader>

          <TableBody>
            {loading && <StateRow>{t("불러오는 중…")}</StateRow>}
            {!loading && error && <StateRow role="alert">{t(toErrorMessage(error))}</StateRow>}
            {!loading && !error && itemList.length === 0 && (
              <StateRow>{t("조회된 접수 건이 없습니다.")}</StateRow>
            )}

            {itemList.map((item, index) => (
              <Row
                key={item.asNo}
                $index={index}
                type="button"
                onClick={() => navigate("/my-as-detail", { state: { asNo: item.asNo } })}
              >
                <Thumb>
                  {/* 접수 시 올린 첫 사진의 서명 URL (유효 24시간).
                      저장해 두고 재사용하지 말 것 — 만료되면 화면을 다시 조회한다. */}
                  {resolvePhotoUrl(item) && (
                    <ThumbImage
                      src={resolvePhotoUrl(item)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </Thumb>
                <ProductCell>
                  <ProductName>{item.modelName}</ProductName>
                  <ProductMeta>{t("접수일 {date}", { date: formatDotDate(item.createdAt) })}</ProductMeta>
                </ProductCell>
                <MutedCell>{item.asNo}</MutedCell>
                <div>
                  <StatusLabel status={item.status} label={item.statusLabel} />
                </div>
                <ScheduleCell>{formatSchedule(item, t)}</ScheduleCell>
                <MutedCell>{formatDotDate(item.statusUpdatedAt)}</MutedCell>
                <RowChevron src={chevronDown} alt="" />
              </Row>
            ))}
          </TableBody>
        </Card>

        {totalPages > 1 && (
          <Pagination>
            <PageArrow
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              aria-label={t("이전 페이지")}
            >
              ‹
            </PageArrow>
            {Array.from({ length: totalPages }, (_, index) => (
              <PageNumber
                key={index}
                type="button"
                $active={index === page}
                onClick={() => setPage(index)}
              >
                {index + 1}
              </PageNumber>
            ))}
            <PageArrow
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              aria-label={t("다음 페이지")}
            >
              ›
            </PageArrow>
          </Pagination>
        )}
      </Body>
    </Page>
  );
}

/* ------------------------------------------------------------------ 레이아웃 */

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
  padding: 60px 48px 100px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 36px;

  @media (max-width: 640px) {
    padding: 40px 18px 60px;
  }
`;

const TopRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PageTitle = styled.h1`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

/* ------------------------------------------------------------------ 필터 */

const FilterGroup = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
`;

/** 선택된 버튼 뒤를 따라 미끄러지는 배경. 버튼보다 뒤에 깔린다. */
const FilterIndicator = styled.span`
  position: absolute;
  top: 4px;
  left: 0;
  bottom: 4px;
  border-radius: 4px;
  background: #222;
  transition:
    transform 240ms cubic-bezier(0.4, 0, 0.2, 1),
    width 240ms cubic-bezier(0.4, 0, 0.2, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FilterButton = styled.button`
  position: relative;
  z-index: 1;
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  line-height: 18px;
  letter-spacing: 0.48px;
  color: ${(props) => (props.$active ? "#fff" : "#919191")};
  transition: color 240ms ease;
`;

/* ------------------------------------------------------------------ 카드 */

const Card = styled.section`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
`;

/** 헤더 밑줄이 좌우 24px 안쪽으로만 들어가는 디자인 */
const CardHeader = styled.div`
  width: 100%;
  box-sizing: border-box;
  padding: 0 24px;
`;

const CardHeaderInner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

const TotalCount = styled.span`
  font-size: 11px;
  font-weight: 400;
  line-height: 16.5px;
  letter-spacing: 0;
  text-transform: none;
  color: #9ca3af;
`;

/* ------------------------------------------------------------------ 요약 */

const SummaryGrid = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 24px 32px;
  box-sizing: border-box;
  border-right: ${(props) => (props.$last ? "none" : "1px solid #ededed")};

  @media (max-width: 640px) {
    border-right: none;
    border-bottom: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
  }
`;

const SummaryLabel = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: #919191;
`;

const SummaryValue = styled.p`
  ${reveal}
  min-height: 35px;
  margin: 0;
  font-size: 28px;
  line-height: 35px;
  color: #222;
`;

const SummaryNote = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #c4c4c4;
`;

/* ------------------------------------------------------------------ 목록 표 */

/** 헤더와 본문 행이 공유하는 열 정의 (썸네일 / 제품 / 접수번호 / 상태 / 일정 / 갱신일 / 화살표) */
const gridTemplate = `
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) 120px 140px 160px 120px 16px;
  gap: 16px;
  align-items: center;

  @media (max-width: 1100px) {
    grid-template-columns: 56px minmax(0, 1fr) 140px 16px;
  }
`;

const TableHeader = styled.div`
  ${gridTemplate}
  height: 40px;
  padding: 0 24px;
  box-sizing: border-box;
  background: #f9f9f9;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const HeaderCell = styled.span`
  font-size: 10px;
  line-height: 15px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #919191;
`;

const TableBody = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Row = styled.button`
  ${revealOnMount}
  ${gridTemplate}
  width: 100%;
  padding: 16px 24px;
  box-sizing: border-box;
  border: none;
  border-bottom: 1px solid #f7f7f5;
  background: #fff;
  text-align: left;
  font: inherit;
  cursor: pointer;
  transition: background 120ms ease;

  /* 디자인 572:11939 — 호버 시 행 배경이 회색으로 바뀐다 */
  &:hover {
    background: #f9f9f9;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const Thumb = styled.div`
  width: 56px;
  height: 56px;
  overflow: hidden;
  border-radius: 8px;
  background: #f2f2f0;
`;

const ThumbImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ProductCell = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ProductName = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 19.5px;
  color: #222;
`;

const ProductMeta = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;
`;

const MutedCell = styled.p`
  margin: 0;
  min-width: 0;
  font-size: 11px;
  line-height: 16.5px;
  color: #919191;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const ScheduleCell = styled.p`
  margin: 0;
  min-width: 0;
  font-size: 12px;
  line-height: 12px;
  color: #222;

  @media (max-width: 1100px) {
    display: none;
  }
`;

const RowChevron = styled.img`
  width: 10px;
  height: 5px;
  justify-self: end;
  transform: rotate(-90deg);
`;

const StateRow = styled.p`
  ${revealOnMount}
  margin: 0;
  padding: 40px 24px;
  text-align: center;
  font-size: 12px;
  color: #919191;
`;

/* ------------------------------------------------------------------ 페이지네이션 */

const Pagination = styled.nav`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const pageButton = `
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  border: none;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 12px;
  line-height: 18px;
`;

const PageArrow = styled.button`
  ${pageButton}
  color: #919191;

  &:disabled {
    color: #d1d5db;
    cursor: default;
  }
`;

const PageNumber = styled.button`
  ${pageButton}
  background: ${(props) => (props.$active ? "#222" : "none")};
  color: ${(props) => (props.$active ? "#fff" : "#919191")};
`;
