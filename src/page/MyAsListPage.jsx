import styled from "styled-components";

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

const CardText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #1f2937;
`;

export default function MyAsListPage() {
  return (
    <Page>
      <BodyRow>
        <Body>
          <SectionTitle>나의 AS 내역</SectionTitle>
          <CardText>준비 중인 페이지입니다.</CardText>
        </Body>
      </BodyRow>
    </Page>
  );
}
