import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../components/Button";
import StatusLabel from "../components/StatusLabel";
import * as asCase from "../api/asCase";
import { useApiQuery } from "../api/useApiQuery";
import { formatDotDate, toErrorMessage } from "../api/format";
import { resolvePhotoUrl } from "../api/photo";
import { useT } from "../i18n";
import { revealOnMount } from "../css/motion";

export default function AS_Pick() {
  const t = useT();
  const navigate = useNavigate();

  // 명세 6-1: 711 전용 API 가 없어 A/S 조회 목록(710)을 그대로 재사용한다
  const { data, loading, error } = useApiQuery(
    () => asCase.getList({ filter: "ALL", page: 0, size: 20 }),
    [],
  );
  const itemList = data?.itemList ?? [];

  // 명세 6-1: 목록이 비면 "AS 이력이 없어요" 경로로 이동한다
  useEffect(() => {
    if (!loading && !error && data && itemList.length === 0) {
      navigate("/no-record", { replace: true });
    }
  }, [loading, error, data, itemList.length, navigate]);

  const handleConsult = (item) => {
    navigate("/ai-concierge", {
      state: { asNo: item.asNo, modelName: item.modelName, statusLabel: item.statusLabel },
    });
  };

  return (
    <Page>
      <Body>
        <Heading>
          <PageTitle>{t("상담할 AS 접수 건 선택")}</PageTitle>
          <PageDescription>
            {t("선택한 접수 건의 제품·접수·상담 이력을 바탕으로 상담이 이어집니다.")}
          </PageDescription>
        </Heading>

        <CaseList>
          {loading && (
            <EmptyCard>
              <EmptyText>{t("불러오는 중…")}</EmptyText>
            </EmptyCard>
          )}

          {!loading && error && (
            <EmptyCard>
              <EmptyText>{t(toErrorMessage(error))}</EmptyText>
            </EmptyCard>
          )}

          {itemList.map((item, index) => (
            <CaseCard key={item.asNo} $index={index}>
              <CaseInfo>
                <CaseThumb>
                  {resolvePhotoUrl(item) && (
                    <CaseThumbImage
                      src={resolvePhotoUrl(item)}
                      alt=""
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </CaseThumb>
                <CaseTexts>
                  <CaseNameRow>
                    <CaseName>{item.modelName}</CaseName>
                  </CaseNameRow>
                  <CaseMetaRow>
                    <CaseId>{item.asNo}</CaseId>
                    <StatusLabel status={item.status} label={item.statusLabel} />
                  </CaseMetaRow>
                  <CaseDate>{t("접수일 {date}", { date: formatDotDate(item.createdAt) })}</CaseDate>
                </CaseTexts>
              </CaseInfo>
              <Button type="button" onClick={() => handleConsult(item)}>
                {t("이 건으로 상담")}
              </Button>
            </CaseCard>
          ))}

          <EmptyCard>
            <EmptyText>{t("접수 건 없이 신규 상담을 시작하시겠습니까?")}</EmptyText>
            {/* 접수 건을 고르지 않고 바로 상담을 시작한다 — asNo 없이 들어가면
                서버가 이력 없는 신규 상담 인사말을 준다 (명세 6-2) */}
            <EmptyLink type="button" onClick={() => navigate("/ai-concierge")}>
              {t("AS 이력이 없어요")}
            </EmptyLink>
          </EmptyCard>
        </CaseList>
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
  max-width: 894px;
  margin: 0 auto;
  padding: 52px 48px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const PageDescription = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 16px;
  color: #222;
`;

const CaseList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CaseCard = styled.div`
  ${revealOnMount}
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const CaseInfo = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 20px;
`;

const CaseThumb = styled.div`
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  overflow: hidden;
  background: #ededed;
  border-radius: 4px;
`;

const CaseThumbImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CaseTexts = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
`;

const CaseNameRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const CaseName = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  line-height: 14px;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: #222;
`;

const CaseMetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
`;

const CaseId = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;



const CaseDate = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 12px;
  color: #313131;
`;

const EmptyCard = styled.div`
  ${revealOnMount}
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 24px 28px;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 4px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 19.5px;
  color: #919191;
`;

const EmptyLink = styled.button`
  padding: 0;
  border: none;
  background: none;
  font-size: 12px;
  font-weight: 500;
  line-height: 18px;
  color: #222;
  text-decoration: underline;
  cursor: pointer;
`;
