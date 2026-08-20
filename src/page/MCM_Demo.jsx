import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import styled, { css, keyframes } from "styled-components";

import productImage from "../assets/product_stark_backpack.avif";
import { useT } from "../i18n";

/**
 * 서비스 흐름 시연 화면.
 *
 * 실제로 라우팅하지 않고 이 한 화면 안에서 접수 흐름을 재생한다.
 * 가짜 브라우저 창의 주소가 바뀌고, 커서가 목표 지점으로 움직여 누르면
 * 다음 화면으로 넘어가는 식이다. 서버를 호출하지 않으므로 데이터는 모두 예시값이다.
 *
 * 화면은 실제 페이지와 같은 치수(컬럼 비율 797:522 · 같은 카드 셸 · 같은 토큰)로
 * 1180px 폭에 그린 뒤 무대 너비에 맞춰 통째로 축소한다.
 * 그래서 작게 보여도 배치가 실제 화면과 같다.
 */

const LOGICAL_WIDTH = 1180;
const LOGICAL_HEIGHT = 700;

// 각 단계: 어떤 화면을 보여 주고, 커서가 무엇을 누르고, 무슨 일이 일어나는지
const STEPS = [
  {
    screen: "landing",
    path: "/",
    target: "start",
    caption: "매장에 가지 않고, 홈에서 바로 접수를 시작합니다.",
  },
  {
    screen: "product",
    path: "/product-info",
    target: "warranty",
    effect: "filled",
    caption: "보증서 번호를 넣으면 제품 종류·모델명·구매일·구매처가 자동으로 채워집니다.",
  },
  {
    screen: "product",
    path: "/product-info",
    target: "upload",
    effect: "photos",
    caption: "손상 사진을 올립니다. 최소 1장, 최대 4장까지 첨부할 수 있습니다.",
  },
  {
    screen: "product",
    path: "/product-info",
    target: "submit",
    caption: "입력을 마치고 예상 견적을 확인합니다.",
  },
  {
    screen: "estimate",
    path: "/ai-estimate",
    target: "toPickup",
    caption: "AI가 손상 유형을 분류하고, 확정가가 아닌 범위로 비용을 안내합니다.",
  },
  {
    screen: "pickup",
    path: "/pickup-reservation",
    target: "day",
    effect: "day",
    caption: "원하는 픽업 날짜와 시간대를 고릅니다.",
  },
  {
    screen: "pickup",
    path: "/pickup-reservation",
    target: "confirm",
    caption: "매장 방문 없이, 신원 확인된 기사가 지정한 일정에 방문합니다.",
  },
  {
    screen: "done",
    path: "/reservation-complete",
    target: null,
    caption: "예약이 확정됩니다. 여기까지가 A/S 접수 흐름입니다.",
  },
  {
    screen: "list",
    path: "/my-as-list",
    target: "row",
    caption: "A/S 조회에서 접수한 건의 진행 상태와 일정을 한눈에 봅니다.",
  },
  {
    screen: "detail",
    path: "/my-as-detail",
    target: "toChat",
    caption: "리페어 패스포트에서 현재 처리 단계와 위치, 수선 이력을 추적합니다.",
  },
  {
    screen: "chat",
    path: "/ai-concierge",
    target: "send",
    effect: "chat",
    caption: "AI 컨시어지는 접수 이력을 이미 알고 있어, 반복 설명 없이 물어볼 수 있습니다.",
  },
];

/**
 * 전체 재생 시간을 정해 두고 한 단계 길이를 역산한다.
 * 단계를 더 넣거나 빼도 총 길이는 그대로 유지된다.
 *
 * 한 단계는 화면 살펴보기 → 커서 이동 → 클릭·결과 → 머무르기 순으로 흐르고,
 * 발표자가 설명할 여유를 두려고 뒤쪽을 길게 잡았다.
 */
const TOTAL_MS = 120000;
const NEXT_AT = Math.round(TOTAL_MS / STEPS.length);
const MOVE_AT = Math.round(NEXT_AT * 0.18);
const CLICK_AT = Math.round(NEXT_AT * 0.45);

// 전체 재생 시간으로 고르게 한다 — 발표 시간에 맞추기 쉽다.
const DURATIONS = [
  { minutes: 1, factor: 0.5 },
  { minutes: 2, factor: 1 },
  { minutes: 3, factor: 1.5 },
];
const DEFAULT_DURATION = 1;

const FLOW_STEPS = ["제품 정보 입력", "AI 예상 견적", "픽업 예약", "예약 완료"];

/** 실제 화면의 StepIndicator 와 같은 구성 — 완료는 회색 체크, 현재는 검은 번호. */
function StepBar({ current }) {
  const t = useT();

  return (
    <Steps>
      {FLOW_STEPS.map((label, index) => {
        const state = index < current ? "done" : index === current ? "now" : "next";
        return (
          <StepGroup key={label}>
            <StepBadge $state={state}>{state === "done" ? "✓" : index + 1}</StepBadge>
            <StepLabel $state={state}>{t(label)}</StepLabel>
            {index < FLOW_STEPS.length - 1 && <StepLine />}
          </StepGroup>
        );
      })}
    </Steps>
  );
}

/** 모든 시연 화면이 공유하는 상단 사이트 바. */
function SiteHeader() {
  const t = useT();

  return (
    <SiteBar>
      <SiteLogo>CUSTODIA</SiteLogo>
      <SiteNav>
        <span>{t("A/S 접수")}</span>
        <span>{t("A/S 조회")}</span>
        <span>{t("AI 상담")}</span>
      </SiteNav>
    </SiteBar>
  );
}

export default function MCM_Demo() {
  const t = useT();
  const viewportRef = useRef(null);

  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(DEFAULT_DURATION);
  const [scale, setScale] = useState(1);
  const [cursor, setCursor] = useState({ x: 0, y: 0, ready: false });
  const [clicking, setClicking] = useState(false);
  const [pressed, setPressed] = useState(null);
  const [effects, setEffects] = useState([]);

  const current = STEPS[step];
  const factor = DURATIONS[speed].factor;

  // 논리 크기로 그린 화면을 무대 너비에 맞춘다
  useLayoutEffect(() => {
    const el = viewportRef.current;
    if (!el) return undefined;

    // 창이 접혀 폭이 0으로 잡히는 순간이 있다. 그때 배율을 0으로 두면
    // 화면 전체가 사라지므로 직전 배율을 유지한다.
    const fit = () => {
      const width = el.clientWidth;
      if (width > 0) setScale(width / LOGICAL_WIDTH);
    };
    fit();

    const observer = new ResizeObserver(fit);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  /**
   * 목표 요소의 가운데로 커서를 옮긴다.
   * 좌표를 박아 두지 않고 화면에 그려진 실제 위치를 재기 때문에,
   * 축소 배율이나 창 크기가 달라져도 커서가 정확히 그 위에 놓인다.
   */
  const moveToTarget = useCallback((targetId) => {
    // 커서는 Viewport 안에 절대배치된다. 그래서 좌표도 Viewport 기준으로 재야 한다.
    // (Stage 기준으로 재면 위쪽 브라우저 바 높이만큼 통째로 밀린다)
    const viewport = viewportRef.current;
    if (!viewport || !targetId) return;

    const el = viewport.querySelector(`[data-target="${targetId}"]`);
    if (!el) return;

    const originBox = viewport.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    if (box.width === 0 && box.height === 0) return;

    setCursor({
      x: box.left - originBox.left + box.width / 2,
      y: box.top - originBox.top + box.height / 2,
      ready: true,
    });
  }, []);

  // 단계가 바뀌면 이동 → 클릭 → 다음 단계를 차례로 예약한다
  useEffect(() => {
    if (!playing) return undefined;

    const timers = [];
    const { target, effect } = STEPS[step];
    const at = (ms) => ms * factor;

    // 화면이 자리를 잡은 다음 재야 커서가 어긋나지 않는다
    timers.push(
      setTimeout(() => {
        requestAnimationFrame(() => moveToTarget(target));
      }, at(MOVE_AT)),
    );

    timers.push(
      setTimeout(() => {
        if (!target) return;
        // 누르기 직전에 한 번 더 잰다 — 그사이 레이아웃이 움직였을 수 있다
        moveToTarget(target);
        setClicking(true);
        setPressed(target);
        if (effect) setEffects((prev) => (prev.includes(effect) ? prev : [...prev, effect]));
        timers.push(setTimeout(() => setClicking(false), 360));
        timers.push(setTimeout(() => setPressed(null), 300));
      }, at(CLICK_AT)),
    );

    timers.push(
      setTimeout(() => {
        setStep((prev) => {
          const next = prev + 1;
          if (next >= STEPS.length) {
            setEffects([]);
            return 0;
          }
          return next;
        });
      }, at(NEXT_AT)),
    );

    return () => timers.forEach(clearTimeout);
  }, [step, playing, factor, moveToTarget]);

  // 배율이 바뀌면(창 크기 변화) 커서를 목표 위에 다시 맞춘다
  useEffect(() => {
    moveToTarget(STEPS[step].target);
  }, [scale, step, moveToTarget]);

  const restart = () => {
    setEffects([]);
    setStep(0);
    setPlaying(true);
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === " ") {
        e.preventDefault();
        setPlaying((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setStep((prev) => (prev + 1) % STEPS.length);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setStep((prev) => (prev - 1 + STEPS.length) % STEPS.length);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filled = effects.includes("filled");
  const photos = effects.includes("photos");
  const day = effects.includes("day");
  const chatted = effects.includes("chat");

  return (
    <Page>
      <Body>
        <Head>
          <PageTitle>{t("서비스 흐름 시연")}</PageTitle>
          <HeadNote>{t("접수부터 예약 완료까지, 실제 화면 구성으로 재생됩니다.")}</HeadNote>
        </Head>

        <Stage>
          <Chrome>
            <Dots>
              <span />
              <span />
              <span />
            </Dots>
            <UrlBar>
              <UrlHost>custodia.care</UrlHost>
              <UrlPath key={current.path}>{current.path}</UrlPath>
            </UrlBar>
          </Chrome>

          <Viewport ref={viewportRef} style={{ height: LOGICAL_HEIGHT * scale }}>
            <Canvas style={{ transform: `scale(${scale})` }}>
              {/* ── 홈 (랜딩) ── */}
              <Screen $on={current.screen === "landing"}>
                <SiteHeader />
                <Sheet $center>
                  <Hero>
                    <div>
                      <HeroTitle>
                        {t("명품 AS,")}
                        <br />
                        {t("이제는 예측 가능하게")}
                      </HeroTitle>
                      <HeroDesc>
                        {t("사진 한 장으로 예상 수선비를 확인하고, 픽업부터 완료까지 추적하세요.")}
                      </HeroDesc>
                      <HeroActions>
                        <Btn data-target="start" $pressed={pressed === "start"}>
                          {t("AS 접수 시작하기")}
                        </Btn>
                        <Btn $ghost>{t("이용 방법 보기")}</Btn>
                      </HeroActions>
                    </div>
                    <Card>
                      <CardHead>{t("예상 수선 비용")}</CardHead>
                      <CardBody>
                        <Row>
                          <K>{t("하드웨어 교체")}</K>
                          <V>₩80,000~</V>
                        </Row>
                        <Row>
                          <K>{t("스티칭 수선")}</K>
                          <V>₩40,000~</V>
                        </Row>
                        <Total>
                          <span>{t("예상 합계")}</span>
                          <span>₩120,000~190,000</span>
                        </Total>
                      </CardBody>
                    </Card>
                  </Hero>
                </Sheet>
              </Screen>

              {/* ── 제품 정보 입력 ── */}
              <Screen $on={current.screen === "product"}>
                <SiteHeader />
                <Sheet>
                  <Back>{t("홈화면으로")}</Back>
                  <TopRow>
                    <ScreenTitle>{t("제품 정보 입력")}</ScreenTitle>
                    <StepBar current={0} />
                    <TopRight>
                      <Btn data-target="submit" $pressed={pressed === "submit"}>
                        {t("예상 견적 확인하기")}
                      </Btn>
                    </TopRight>
                  </TopRow>
                  <Cols>
                    <Col>
                      <Card>
                        <CardHead>{t("제품 정보")}</CardHead>
                        <CardBody>
                          <Grid2>
                            <Field $full>
                              <Lab>{t("보증서 번호")}</Lab>
                              <Ctl
                                data-target="warranty"
                                $filled={filled}
                                $pressed={pressed === "warranty"}
                              >
                                {filled
                                  ? "20091123"
                                  : t("보증서 번호 입력 시 아래 정보가 자동 입력됩니다.")}
                              </Ctl>
                              {filled && (
                                <Ok>{t("보증서 정보를 불러와 아래 항목을 채웠습니다.")}</Ok>
                              )}
                            </Field>
                            <Field>
                              <Lab>{t("제품 종류")}</Lab>
                              <Ctl $filled={filled}>{filled ? t("캐리어") : t("선택")}</Ctl>
                            </Field>
                            <Field>
                              <Lab>{t("제품 모델명")}</Lab>
                              <Ctl $filled={filled}>
                                {filled ? "MCM 스타크 비세토스 캐리어" : t("모델명")}
                              </Ctl>
                            </Field>
                            <Field>
                              <Lab>{t("구매 날짜")}</Lab>
                              <Ctl $filled={filled}>{filled ? "2025-12-20" : "연도. 월. 일."}</Ctl>
                            </Field>
                            <Field>
                              <Lab>{t("구매처")}</Lab>
                              <Ctl $filled={filled}>
                                {filled ? t("MCM 공식 매장") : t("선택")}
                              </Ctl>
                            </Field>
                          </Grid2>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("손상 설명")}</CardHead>
                        <CardBody>
                          <Field>
                            <Lab>{t("손상 부위")}</Lab>
                            <Ctl $filled>{t("스트랩 연결부")}</Ctl>
                          </Field>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col>
                      <Card>
                        <CardHead>{t("손상 사진 업로드")}</CardHead>
                        <CardBody>
                          <Note>
                            {t("제품 사진을 최소 1장, 최대 {max}장까지 첨부할 수 있습니다.", {
                              max: 4,
                            })}
                          </Note>
                          <PhotoRow>
                            <PhotoTile data-target="upload" $slot $pressed={pressed === "upload"}>
                              {photos ? "1/4" : "0/4"}
                            </PhotoTile>
                            {photos && <PhotoTile $shot />}
                          </PhotoRow>
                        </CardBody>
                      </Card>
                      <DarkPanel>
                        <DarkTitle>{t("예상 견적 안내")}</DarkTitle>
                        <DarkList>
                          <li>
                            {t(
                              "제출하신 사진과 정보를 바탕으로 AI가 예상 수선 비용 범위를 안내합니다.",
                            )}
                          </li>
                          <li>
                            {t("예상 금액은 참고용이며, 실물 진단 후 최종 견적이 달라질 수 있습니다.")}
                          </li>
                        </DarkList>
                      </DarkPanel>
                    </Col>
                  </Cols>
                </Sheet>
              </Screen>

              {/* ── AI 예상 견적 ── */}
              <Screen $on={current.screen === "estimate"}>
                <SiteHeader />
                <Sheet>
                  <Back>{t("제품 정보 입력으로")}</Back>
                  <TopRow>
                    <ScreenTitle>{t("AI 예상 견적 결과")}</ScreenTitle>
                    <StepBar current={1} />
                    <TopRight>
                      <Btn data-target="toPickup" $pressed={pressed === "toPickup"}>
                        {t("AS 접수 시작하기")}
                      </Btn>
                    </TopRight>
                  </TopRow>
                  <Cols>
                    <Col>
                      <Card>
                        <CardHead>{t("제품 정보 요약")}</CardHead>
                        <CardBody>
                          <PhotoRow>
                            <PhotoTile $shot />
                          </PhotoRow>
                          <Row>
                            <K>{t("제품명")}</K>
                            <V>MCM 스타크 비세토스 캐리어</V>
                          </Row>
                          <Row>
                            <K>{t("손상 부위")}</K>
                            <V>{t("스트랩 연결부 마모")}</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("예상 수선 비용 범위")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("하드웨어 교체")}</K>
                            <V>약 ₩80,000</V>
                          </Row>
                          <Row>
                            <K>{t("스티칭 수선")}</K>
                            <V>약 ₩40,000</V>
                          </Row>
                          <Total>
                            <span>{t("예상 합계")}</span>
                            <span>₩120,000~190,000</span>
                          </Total>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col>
                      <Card>
                        <CardHead>{t("AI 손상 유형 분석")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("분류된 손상 유형")}</K>
                            <V>{t("스트랩 연결부 마모")}</V>
                          </Row>
                          <Row>
                            <K>{t("손상 정도")}</K>
                            <V>{t("중간")}</V>
                          </Row>
                          <Row>
                            <K>{t("분석 신뢰도")}</K>
                            <V>{t("높음")}</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("보증 적용 가능 여부")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("구매일")}</K>
                            <V>2025-12-20</V>
                          </Row>
                          <Row>
                            <K>{t("보증 기간")}</K>
                            <V>{t("보증 {months}개월", { months: 24 })}</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <DarkPanel>
                        <DarkTitle>{t("최종 견적 안내")}</DarkTitle>
                        <DarkList>
                          <li>{t("이 견적은 AI가 사진을 분석한 참고용 견적입니다.")}</li>
                        </DarkList>
                      </DarkPanel>
                    </Col>
                  </Cols>
                </Sheet>
              </Screen>

              {/* ── 픽업 예약 ── */}
              <Screen $on={current.screen === "pickup"}>
                <SiteHeader />
                <Sheet>
                  <Back>{t("AI 예상 견적 결과")}</Back>
                  <TopRow>
                    <ScreenTitle>{t("픽업 예약")}</ScreenTitle>
                    <StepBar current={2} />
                    <TopRight>
                      <Btn data-target="confirm" $pressed={pressed === "confirm"}>
                        {t("예약 확정하기")}
                      </Btn>
                    </TopRight>
                  </TopRow>
                  <Cols>
                    <Col>
                      <Card>
                        <CardHead>{t("접수 건 정보")}</CardHead>
                        <CardBody>
                          <ReceiptRow>
                            <Thumb />
                            <div>
                              <ProductName>MCM 스타크 비세토스 캐리어</ProductName>
                              <ReceiptNo>
                                {t("AS 접수번호:")} <b>MCM-2024-008431</b>
                              </ReceiptNo>
                              <StatusRow>
                                <StatusDot />
                                {t("견적 안내 완료")}
                              </StatusRow>
                            </div>
                          </ReceiptRow>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("픽업 일시 선택")}</CardHead>
                        <CardBody>
                          <Grid2>
                            <Field>
                              <Lab>{t("픽업 날짜")}</Lab>
                              <Ctl $filled={day}>
                                {day ? "2026년 9월 17일 (목)" : t("날짜 선택")}
                              </Ctl>
                            </Field>
                            <Field>
                              <Lab>{t("픽업 시간대")}</Lab>
                              <Ctl $filled={day}>{day ? "10:00 – 12:00" : t("시간대 선택")}</Ctl>
                            </Field>
                          </Grid2>
                          <Calendar>
                            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
                              <Day key={d} $head>
                                {t(d)}
                              </Day>
                            ))}
                            {Array.from({ length: 21 }, (_, i) => 13 + i).map((n) => (
                              <Day
                                key={n}
                                data-target={n === 17 ? "day" : undefined}
                                $picked={n === 17 && day}
                                $pressed={n === 17 && pressed === "day"}
                              >
                                {n}
                              </Day>
                            ))}
                          </Calendar>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col>
                      <Card>
                        <CardHead>{t("예약 정보 확인")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("접수 번호")}</K>
                            <V>MCM-2024-008431</V>
                          </Row>
                          <Row>
                            <K>{t("픽업 날짜")}</K>
                            <V $muted={!day}>{day ? "2026년 9월 17일" : "—"}</V>
                          </Row>
                          <Row>
                            <K>{t("픽업 시간대")}</K>
                            <V $muted={!day}>{day ? "10:00 – 12:00" : "—"}</V>
                          </Row>
                          <Row>
                            <K>{t("수거 주소")}</K>
                            <V>{t("서울 강남구 테헤란로 123")}</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <DarkPanel>
                        <DarkTitle>{t("운송 보험 및 유의사항")}</DarkTitle>
                        <DarkList>
                          <li>
                            {t(
                              "픽업 시 운송 보험이 자동 적용되며, 수선센터 도착까지 제품을 보호합니다.",
                            )}
                          </li>
                          <li>{t("예약 확정 후 취소는 픽업 예정일 24시간 전까지 가능합니다.")}</li>
                        </DarkList>
                      </DarkPanel>
                    </Col>
                  </Cols>
                </Sheet>
              </Screen>

              {/* ── 예약 완료 ── */}
              <Screen $on={current.screen === "done"}>
                <SiteHeader />
                <Sheet>
                  <Back>{t("픽업 예약")}</Back>
                  <TopRow>
                    <ScreenTitle>{t("픽업 예약 완료")}</ScreenTitle>
                    <StepBar current={3} />
                    <TopRight>
                      <Btn>{t("확인")}</Btn>
                    </TopRight>
                  </TopRow>
                  <Confirm>
                    <Check viewBox="0 0 48 48" aria-hidden="true">
                      <circle cx="24" cy="24" r="21" />
                      <path d="M15 24.5 L21.5 31 L33 19" />
                    </Check>
                    <div>
                      <ConfirmTitle>{t("예약이 확정되었습니다")}</ConfirmTitle>
                      <ConfirmDesc>{t("신원 확인된 기사가 지정한 일정에 방문합니다.")}</ConfirmDesc>
                    </div>
                  </Confirm>
                  <Cols>
                    <Card>
                      <CardHead>{t("예약 정보 확인")}</CardHead>
                      <CardBody>
                        <Row>
                          <K>{t("예약 번호")}</K>
                          <V>PU-2026-004182</V>
                        </Row>
                        <Row>
                          <K>{t("픽업 일정")}</K>
                          <V>2026년 9월 17일 (목) 10:00 – 12:00</V>
                        </Row>
                        <Row>
                          <K>{t("담당 기사")}</K>
                          <V>{t("배차 확인 중")}</V>
                        </Row>
                      </CardBody>
                    </Card>
                    <Card>
                      <CardHead>{t("기사 방문 전 준비 사항")}</CardHead>
                      <CardBody>
                        <Note>{t("제품을 원래 포장재 또는 완충재로 감싸 준비해 주세요.")}</Note>
                        <Note>{t("기사 도착 시 신분증을 확인하실 수 있습니다.")}</Note>
                      </CardBody>
                    </Card>
                  </Cols>
                </Sheet>
              </Screen>
              {/* ── A/S 조회 ── */}
              <Screen $on={current.screen === "list"}>
                <SiteHeader />
                <Sheet>
                  <TopRow>
                    <ScreenTitle>{t("A/S 조회")}</ScreenTitle>
                    <span />
                    <TopRight>
                      <Filters>
                        <Filter $on>{t("전체")}</Filter>
                        <Filter>{t("진행 중")}</Filter>
                        <Filter>{t("완료")}</Filter>
                      </Filters>
                    </TopRight>
                  </TopRow>
                  <Card>
                    <CardHead>{t("나의 AS 현황")}</CardHead>
                    <SummaryGrid>
                      <SummaryCell>
                        <K>{t("진행 중")}</K>
                        <BigNum>1</BigNum>
                        <Tiny>{t("픽업 예약 포함")}</Tiny>
                      </SummaryCell>
                      <SummaryCell>
                        <K>{t("완료")}</K>
                        <BigNum>2</BigNum>
                        <Tiny>{t("누적 완료 건수")}</Tiny>
                      </SummaryCell>
                      <SummaryCell $last>
                        <K>{t("최근 갱신")}</K>
                        <BigNum>2026.09.15</BigNum>
                        <Tiny>{t("마지막 상태 업데이트")}</Tiny>
                      </SummaryCell>
                    </SummaryGrid>
                  </Card>
                  <Card>
                    <CardHead>{t("접수 건 목록")}</CardHead>
                    <TableHead>
                      <span />
                      <span>{t("제품 정보")}</span>
                      <span>{t("접수 번호")}</span>
                      <span>{t("상태")}</span>
                      <span>{t("일정")}</span>
                      <span />
                    </TableHead>
                    <TableRow data-target="row" $pressed={pressed === "row"}>
                      <RowThumb />
                      <div>
                        <ProductName>MCM 스타크 비세토스 캐리어</ProductName>
                        <ReceiptNo>{t("접수일 {date}", { date: "2026.09.15" })}</ReceiptNo>
                      </div>
                      <MutedCell>MCM-2024-008431</MutedCell>
                      <div>
                        <Pill>
                          <StatusDot />
                          {t("접수완료")}
                        </Pill>
                      </div>
                      <MutedCell>{t("예상 완료 {date}", { date: "2026.10.02" })}</MutedCell>
                      <MutedCell>›</MutedCell>
                    </TableRow>
                  </Card>
                </Sheet>
              </Screen>

              {/* ── 리페어 패스포트 상세 ── */}
              <Screen $on={current.screen === "detail"}>
                <SiteHeader />
                <Sheet>
                  <TopRow>
                    <div>
                      <ScreenTitle>{t("리페어 패스포트 상세")}</ScreenTitle>
                      <SubTitle>{t("AS 번호 · 제품명 · 현재 상태를 확인하세요")}</SubTitle>
                    </div>
                    <span />
                    <TopRight>
                      <Btn data-target="toChat" $pressed={pressed === "toChat"}>
                        {t("이 AS 건 상담하기")}
                      </Btn>
                    </TopRight>
                  </TopRow>
                  <Cols>
                    <Col>
                      <Card>
                        <CardHead>{t("접수 건 식별 정보")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("AS 번호")}</K>
                            <V>MCM-2024-008431</V>
                          </Row>
                          <Row>
                            <K>{t("제품명")}</K>
                            <V>MCM 스타크 비세토스 캐리어</V>
                          </Row>
                          <Row>
                            <K>{t("접수일")}</K>
                            <V>2026년 9월 15일</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("수선 진행 이력")}</CardHead>
                        <CardBody>
                          <Timeline>
                            <li>
                              <TlMark $done>✓</TlMark>
                              <div>
                                <TlTitle>{t("접수완료")}</TlTitle>
                                <TlDesc>2026년 9월 15일</TlDesc>
                              </div>
                            </li>
                            <li>
                              <TlMark $now>→</TlMark>
                              <div>
                                <TlTitle>{t("픽업완료")}</TlTitle>
                                <TlDesc>2026년 9월 17일</TlDesc>
                              </div>
                            </li>
                            <li>
                              <TlMark>○</TlMark>
                              <div>
                                <TlTitle $muted>{t("수선중")}</TlTitle>
                                <TlDesc>{t("예정 · {description}", { description: "수선센터 입고" })}</TlDesc>
                              </div>
                            </li>
                          </Timeline>
                        </CardBody>
                      </Card>
                    </Col>
                    <Col>
                      <Card>
                        <CardHead>{t("현재 처리 단계")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("현재 단계")}</K>
                            <V>
                              <Pill>
                                <StatusDot />
                                {t("픽업완료")}
                              </Pill>
                            </V>
                          </Row>
                          <Row>
                            <K>{t("최신 상태 업데이트")}</K>
                            <V>2026년 9월 17일 11:20</V>
                          </Row>
                        </CardBody>
                      </Card>
                      <Card>
                        <CardHead>{t("예상 완료일")}</CardHead>
                        <CardBody>
                          <Row>
                            <K>{t("예상 완료일")}</K>
                            <V>2026년 10월 2일</V>
                          </Row>
                          <Row>
                            <K>{t("위치 유형")}</K>
                            <V>{t("수선센터")}</V>
                          </Row>
                        </CardBody>
                      </Card>
                    </Col>
                  </Cols>
                </Sheet>
              </Screen>

              {/* ── AI 컨시어지 상담 ── */}
              <Screen $on={current.screen === "chat"}>
                <SiteHeader />
                <Sheet>
                  <TopRow>
                    <ScreenTitle>{t("AI 컨시어지 상담")}</ScreenTitle>
                    <span />
                    <TopRight>
                      <Btn $ghost>{t("상담원 연결")}</Btn>
                    </TopRight>
                  </TopRow>
                  <CaseStrip>
                    <div>
                      <K>{t("접수 번호")}</K>
                      <V>MCM-2024-008431</V>
                    </div>
                    <div>
                      <K>{t("제품명")}</K>
                      <V>MCM 스타크 비세토스 캐리어</V>
                    </div>
                    <div>
                      <K>{t("현재 상태")}</K>
                      <V>{t("픽업완료")}</V>
                    </div>
                  </CaseStrip>
                  <ChatBox>
                    <AiRow>
                      <Avatar />
                      <AiBubble>
                        {t("안녕하세요. 접수하신 캐리어 건으로 도와드리겠습니다. 궁금한 점을 말씀해 주세요.")}
                      </AiBubble>
                    </AiRow>
                    {chatted && (
                      <>
                        <UserRow>
                          <UserBubble>{t("수선 완료까지 얼마나 걸리나요?")}</UserBubble>
                        </UserRow>
                        <AiRow>
                          <Avatar />
                          <AiBubble>
                            {t("현재 픽업이 완료되어 수선센터 입고 단계입니다. 예상 완료일은 10월 2일이며, 진행 상황은 리페어 패스포트에서 확인하실 수 있습니다.")}
                          </AiBubble>
                        </AiRow>
                      </>
                    )}
                  </ChatBox>
                  <Composer>
                    <ComposerInput $filled={chatted}>
                      {chatted ? "" : t("수선 완료까지 얼마나 걸리나요?")}
                    </ComposerInput>
                    <ComposerFoot>
                      <Tiny>{t("AI 안내는 참고용이며, 최종 수선 가능 여부 및 비용 확정은 실물 진단 또는 상담원을 통해 진행됩니다.")}</Tiny>
                      <Btn data-target="send" $pressed={pressed === "send"}>
                        {t("전송")}
                      </Btn>
                    </ComposerFoot>
                  </Composer>
                </Sheet>
              </Screen>
            </Canvas>

            {/* 시연용 커서. 축소되는 화면 밖에 두어 크기가 일정하게 유지된다. */}
            <Cursor
              aria-hidden="true"
              $ready={cursor.ready}
              style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
            >
              {clicking && <Ripple />}
              <CursorArrow viewBox="0 0 16 20">
                <path d="M1 1 L1 15.5 L4.8 12.2 L7.2 18.5 L9.8 17.4 L7.4 11.2 L12.5 11 Z" />
              </CursorArrow>
            </Cursor>
          </Viewport>

          <Caption>
            <CaptionStep>
              {step + 1} / {STEPS.length}
            </CaptionStep>
            <CaptionText key={step}>{t(current.caption)}</CaptionText>
          </Caption>
        </Stage>

        <Controls>
          <ControlButton type="button" onClick={() => setPlaying((prev) => !prev)}>
            {playing ? t("일시정지") : t("재생")}
          </ControlButton>
          <ControlButton type="button" onClick={restart}>
            {t("처음부터")}
          </ControlButton>
          <SpeedGroup>
            {DURATIONS.map((option, index) => (
              <SpeedButton
                key={option.minutes}
                type="button"
                $on={speed === index}
                onClick={() => setSpeed(index)}
              >
                {t("{minutes}분", { minutes: option.minutes })}
              </SpeedButton>
            ))}
          </SpeedGroup>
          <ControlHint>{t("스페이스 재생·정지 · ← → 단계 이동")}</ControlHint>
        </Controls>
      </Body>
    </Page>
  );
}

/* ─────────────────────────────────────────────
   시연 껍데기
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
  padding: 40px 48px 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 640px) {
    padding: 28px 18px 48px;
  }
`;

const Head = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const HeadNote = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 18px;
  color: #6b6b65;
`;

const Stage = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
  box-shadow: 0 20px 50px -30px rgba(0, 0, 0, 0.35);
`;

const Chrome = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 16px;
  background: #f0f0f0;
  border-bottom: 1px solid #ededed;
`;

const Dots = styled.div`
  display: flex;
  gap: 6px;

  span {
    width: 9px;
    height: 9px;
    border-radius: var(--radius-pill);
    background: #d1d5db;
  }
`;

const UrlBar = styled.div`
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 2px;
  padding: 6px 12px;
  background: #fff;
  border: 1px solid #ededed;
  border-radius: var(--radius-pill);
  font-size: 11px;
`;

const UrlHost = styled.span`
  color: #919191;
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const UrlPath = styled.span`
  font-weight: 700;
  color: #222;
  animation: ${fadeIn} 0.4s ease both;
`;

const Viewport = styled.div`
  position: relative;
  overflow: hidden;
  background: #f9f9f9;
`;

/** 논리 크기로 그린 뒤 통째로 축소한다 — 배치가 실제 화면과 같아진다. */
const Canvas = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: ${LOGICAL_WIDTH}px;
  height: ${LOGICAL_HEIGHT}px;
  transform-origin: top left;
`;

const Screen = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  background: #f9f9f9;
  opacity: ${(props) => (props.$on ? 1 : 0)};
  visibility: ${(props) => (props.$on ? "visible" : "hidden")};
  /* 나가는 화면을 먼저 지운 다음 들어오는 화면을 띄워 글자가 겹치지 않게 한다 */
  transition: ${(props) =>
    props.$on
      ? "opacity 0.34s ease 0.22s, visibility 0s linear 0.22s"
      : "opacity 0.2s ease, visibility 0s linear 0.2s"};
`;

/* ─────────────────────────────────────────────
   제품 화면 — 실제 페이지와 같은 구성
   ───────────────────────────────────────────── */

const SiteBar = styled.div`
  flex: none;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 34px;
  background: #fff;
  border-bottom: 1px solid #ededed;
`;

const SiteLogo = styled.span`
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #222;
`;

const SiteNav = styled.div`
  display: flex;
  gap: 34px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #6b6b65;
`;

const Sheet = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: ${(props) => (props.$center ? "0" : "14px")};
  padding: ${(props) => (props.$center ? "0" : "20px 34px 24px")};
  justify-content: ${(props) => (props.$center ? "center" : "flex-start")};
  background: ${(props) => (props.$center ? "#fff" : "transparent")};
`;

const Back = styled.span`
  font-size: 10px;
  line-height: 10px;
  text-transform: uppercase;
  color: #919191;

  &::before {
    content: "‹ ";
  }
`;

/** 실제 화면과 같은 1fr auto 1fr — 단계 표시가 가운데에 놓인다. */
const TopRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
`;

const ScreenTitle = styled.p`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #222;
`;

const TopRight = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const Steps = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StepGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StepBadge = styled.span`
  width: 18px;
  height: 18px;
  flex: none;
  display: grid;
  place-items: center;
  box-sizing: border-box;
  border-radius: var(--radius-pill);
  font-size: 10px;
  background: ${(props) =>
    props.$state === "now" ? "#222" : props.$state === "done" ? "#919191" : "#fff"};
  border: 1px solid ${(props) => (props.$state === "next" ? "#919191" : "transparent")};
  color: ${(props) => (props.$state === "next" ? "#919191" : "#fff")};
`;

const StepLabel = styled.span`
  font-size: 10px;
  white-space: nowrap;
  color: ${(props) => (props.$state === "now" ? "#222" : "#919191")};
  font-weight: ${(props) => (props.$state === "now" ? 500 : 400)};
`;

const StepLine = styled.span`
  width: 26px;
  height: 1px;
  margin: 0 6px;
  background: #919191;
  opacity: 0.5;
`;

/** 실제 화면의 컬럼 비율 797 : 522 */
const Cols = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 797fr) minmax(0, 522fr);
  align-items: start;
  gap: 18px;
`;

const Col = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
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

const CardHead = styled.p`
  margin: 0 16px;
  padding: 14px 0;
  border-bottom: 1px solid #ededed;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const Grid2 = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
`;

const Field = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-column: ${(props) => (props.$full ? "1 / -1" : "auto")};
`;

const Lab = styled.span`
  font-size: 11px;
  line-height: 11px;
  color: #313131;
`;

const pressable = css`
  transition:
    transform 0.15s ease,
    color 0.3s ease,
    background 0.2s ease;
  transform: ${(props) => (props.$pressed ? "scale(0.97)" : "none")};
`;

const Ctl = styled.span`
  ${pressable}
  display: flex;
  align-items: center;
  min-height: 34px;
  padding: 9px 12px;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-control);
  font-size: 11px;
  color: ${(props) => (props.$filled ? "#222" : "#919191")};
`;

const Ok = styled.span`
  font-size: 10px;
  line-height: 15px;
  color: #4b7c5a;
  animation: ${fadeIn} 0.4s ease both;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 0;
  border-bottom: 1px solid #ededed;

  &:last-child {
    border-bottom: 0;
  }
`;

const K = styled.span`
  flex: none;
  font-size: 11px;
  color: #919191;
`;

const V = styled.span`
  font-size: 11px;
  font-weight: 500;
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$muted ? "#919191" : "#222")};
  transition: color 0.3s ease;
`;

const Total = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 2px;
  padding: 10px 12px;
  background: #222;
  border-radius: var(--radius-control);
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  font-variant-numeric: tabular-nums;
`;

const Note = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 17.5px;
  color: #6b6b65;
`;

const Btn = styled.span`
  ${pressable}
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 20px;
  border-radius: var(--radius-control);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  white-space: nowrap;
  background: ${(props) => (props.$ghost ? "transparent" : "#222")};
  border: 1px solid #222;
  color: ${(props) => (props.$ghost ? "#222" : "#fff")};
`;

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 437fr) minmax(0, 504fr);
  align-items: center;
  gap: 50px;
  padding: 0 60px;
`;

const HeroTitle = styled.p`
  margin: 0 0 14px;
  font-size: 38px;
  font-weight: 700;
  line-height: 50px;
  color: #000;
`;

const HeroDesc = styled.p`
  margin: 0 0 20px;
  font-size: 13px;
  line-height: 21px;
  color: #6b6b65;
`;

const HeroActions = styled.div`
  display: flex;
  gap: 10px;
`;

const DarkPanel = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: #313131;
  border-radius: var(--radius-card);
`;

const DarkTitle = styled.p`
  margin: 0;
  font-size: 11px;
  color: #fff;
`;

const DarkList = styled.ul`
  margin: 0;
  padding: 0 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;

  li {
    list-style: disc;
    font-size: 10px;
    line-height: 16px;
    color: rgba(255, 255, 255, 0.5);
  }
`;

const PhotoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
`;

const pop = keyframes`
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: none; }
`;

const PhotoTile = styled.span`
  ${pressable}
  width: 62px;
  height: 62px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--radius-control);
  font-size: 10px;
  color: #919191;

  ${(props) =>
    props.$slot &&
    css`
      background: #f0f0f0;
      border: 1px dashed #919191;
    `}

  ${(props) =>
    props.$shot &&
    css`
      background: url(${productImage}) center / cover no-repeat, #f2f2f0;
      border: 1px solid #ededed;
      animation: ${pop} 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
    `}
`;

const ReceiptRow = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const Thumb = styled.span`
  width: 96px;
  height: 68px;
  flex: none;
  border-radius: var(--radius-card);
  background: url(${productImage}) center / cover no-repeat, #f2f2f0;
`;

const ProductName = styled.p`
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 500;
  color: #222;
`;

const ReceiptNo = styled.p`
  margin: 0;
  font-size: 11px;
  color: #919191;

  b {
    font-weight: 500;
    color: #222;
  }
`;

const StatusRow = styled.p`
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 6px 0 0;
  font-size: 11px;
  font-weight: 500;
  color: #4b7c5a;
`;

const StatusDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: var(--radius-pill);
  background: #4b7c5a;
`;

const Calendar = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 3px;
`;

const Day = styled.span`
  ${pressable}
  display: grid;
  place-items: center;
  height: 24px;
  border-radius: 5px;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  color: ${(props) => (props.$head ? "#c4c4c4" : "#313131")};

  ${(props) =>
    props.$picked &&
    css`
      background: #222;
      color: #fff;
      font-weight: 700;
    `}
`;

const Confirm = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const draw = keyframes`
  to { stroke-dashoffset: 0; }
`;

const Check = styled.svg`
  width: 40px;
  height: 40px;
  flex: none;

  circle,
  path {
    fill: none;
    stroke: #4b7c5a;
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  circle {
    stroke-dasharray: 132;
    animation: ${draw} 0.6s ease both;
  }

  path {
    stroke-dasharray: 30;
    animation: ${draw} 0.35s ease 0.45s both;
  }
`;

const ConfirmTitle = styled.p`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: #222;
`;

const ConfirmDesc = styled.p`
  margin: 0;
  font-size: 11px;
  color: #6b6b65;
`;

/* ── A/S 조회 · 상세 · 상담 화면 ── */

const SubTitle = styled.p`
  margin: 4px 0 0;
  font-size: 11px;
  color: #6b6b65;
`;

const Filters = styled.div`
  display: flex;
  gap: 2px;
  padding: 3px;
  background: #f0f0f0;
  border-radius: var(--radius-pill);
`;

const Filter = styled.span`
  padding: 7px 15px;
  border-radius: var(--radius-pill);
  font-size: 11px;
  background: ${(props) => (props.$on ? "#222" : "transparent")};
  color: ${(props) => (props.$on ? "#fff" : "#6b6b65")};
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
`;

const SummaryCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 18px;
  border-right: ${(props) => (props.$last ? "none" : "1px solid #ededed")};
`;

const BigNum = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  line-height: 30px;
  color: #222;
  font-variant-numeric: tabular-nums;
`;

const Tiny = styled.p`
  margin: 0;
  font-size: 10px;
  line-height: 15px;
  color: #919191;
`;

/** 목록 표 — 헤더와 본문 행이 같은 grid-template 을 공유한다. */
const tableGrid = `
  display: grid;
  grid-template-columns: 62px minmax(0, 1.6fr) minmax(0, 1.1fr) minmax(0, 0.9fr) minmax(0, 1fr) 20px;
  align-items: center;
  gap: 12px;
`;

const TableHead = styled.div`
  ${tableGrid}
  padding: 10px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #ededed;
  font-size: 10px;
  color: #919191;
`;

const TableRow = styled.div`
  ${tableGrid}
  ${pressable}
  padding: 14px 16px;
`;

const RowThumb = styled.span`
  width: 62px;
  height: 46px;
  border-radius: var(--radius-control);
  background: url(${productImage}) center / cover no-repeat, #f2f2f0;
`;

const MutedCell = styled.span`
  font-size: 11px;
  color: #919191;
  font-variant-numeric: tabular-nums;
`;

const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: var(--radius-pill);
  background: #e9f0f8;
  font-size: 10px;
  font-weight: 500;
  color: #2467b0;
`;

const Timeline = styled.ul`
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    display: flex;
    align-items: flex-start;
    gap: 10px;
  }
`;

const TlMark = styled.span`
  width: 18px;
  height: 18px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--radius-pill);
  font-size: 9px;
  background: ${(props) => (props.$done ? "#919191" : props.$now ? "#222" : "#fff")};
  border: 1px solid ${(props) => (props.$done ? "#919191" : props.$now ? "#222" : "#c4c4c4")};
  color: ${(props) => (props.$done || props.$now ? "#fff" : "#c4c4c4")};
`;

const TlTitle = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  color: ${(props) => (props.$muted ? "#919191" : "#222")};
`;

const TlDesc = styled.p`
  margin: 2px 0 0;
  font-size: 10px;
  color: #919191;
`;

const CaseStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  padding: 14px 18px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const ChatBox = styled.div`
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
  overflow: hidden;
`;

const AiRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  animation: ${pop} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const Avatar = styled.span`
  width: 22px;
  height: 22px;
  flex: none;
  border-radius: var(--radius-pill);
  background: #222;
`;

const AiBubble = styled.p`
  margin: 0;
  max-width: 62%;
  padding: 10px 13px;
  background: #f0f0f0;
  border-radius: 12px;
  font-size: 11px;
  line-height: 17.5px;
  color: #222;
`;

const UserRow = styled.div`
  display: flex;
  justify-content: flex-end;
  animation: ${pop} 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
`;

const UserBubble = styled.p`
  margin: 0;
  max-width: 62%;
  padding: 10px 13px;
  background: #222;
  border-radius: 12px;
  font-size: 11px;
  line-height: 17.5px;
  color: #fff;
`;

const Composer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-card);
`;

const ComposerInput = styled.p`
  margin: 0;
  min-height: 34px;
  font-size: 11px;
  line-height: 17.5px;
  color: ${(props) => (props.$filled ? "#222" : "#919191")};
`;

const ComposerFoot = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
`;

/* ── 커서 ── */

const Cursor = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  pointer-events: none;
  opacity: ${(props) => (props.$ready ? 1 : 0)};
  transition:
    transform 1.4s cubic-bezier(0.33, 1, 0.68, 1),
    opacity 0.3s ease;
`;

/** 화살표의 뾰족한 끝이 원점(=목표 가운데)에 놓이도록 그린다. */
const CursorArrow = styled.svg`
  display: block;
  width: 17px;
  height: 21px;
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4));

  path {
    fill: #fff;
    stroke: #222;
    stroke-width: 1.5;
  }
`;

const ripple = keyframes`
  from { opacity: 0.6; transform: translate(-50%, -50%) scale(0.25); }
  to { opacity: 0; transform: translate(-50%, -50%) scale(1); }
`;

const Ripple = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  width: 46px;
  height: 46px;
  border: 2px solid #222;
  border-radius: var(--radius-pill);
  animation: ${ripple} 0.55s ease-out both;
`;

/* ── 자막 · 컨트롤 ── */

const Caption = styled.div`
  display: flex;
  align-items: baseline;
  gap: 12px;
  padding: 14px 18px;
  background: #222;
`;

const CaptionStep = styled.span`
  flex: none;
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  letter-spacing: 1px;
  color: #919191;
`;

const CaptionText = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 19.5px;
  color: #fff;
  animation: ${fadeIn} 0.45s ease both;
`;

const Controls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

const ControlButton = styled.button`
  padding: 9px 16px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: var(--radius-pill);
  font-family: inherit;
  font-size: 11px;
  color: #222;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease;

  &:hover {
    border-color: #222;
  }
`;

const SpeedGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px;
  background: #f0f0f0;
  border-radius: var(--radius-pill);
`;

const SpeedButton = styled.button`
  padding: 7px 13px;
  border: none;
  border-radius: var(--radius-pill);
  background: ${(props) => (props.$on ? "#222" : "transparent")};
  color: ${(props) => (props.$on ? "#fff" : "#6b6b65")};
  font-family: inherit;
  font-size: 11px;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
`;

const ControlHint = styled.span`
  font-size: 11px;
  color: #919191;
`;
