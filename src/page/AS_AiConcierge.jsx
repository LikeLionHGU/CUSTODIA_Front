import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import styled, { css } from "styled-components";
import Button from "../components/Button";
import AgentContactModal from "../components/AgentContactModal";
import * as consultation from "../api/consultation";
import { useApiQuery } from "../api/useApiQuery";
import { toErrorMessage } from "../api/format";

export default function AS_AiConcierge() {
  const location = useLocation();
  // 711에서 넘어오면 asNo 가 있고, 718(이력 없음)에서 오면 없다 — 명세 6-2
  const asNo = location.state?.asNo;

  // 화면 진입 시 상담을 생성한다. asNo 가 없으면 이력 없는 신규 상담.
  const { data, loading, error } = useApiQuery(() => consultation.create(asNo), [asNo]);

  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    if (data?.messageList) setMessages(data.messageList);
  }, [data]);

  const caseInfo = [
    { label: "접수 번호", value: data?.asNo || "—" },
    { label: "제품명", value: data?.modelName || "—" },
    { label: "현재 상태", value: data?.statusLabel || "—" },
  ];

  const canSend = draft.trim() !== "" && !sending && !!data?.consultationId;

  const handleSend = async () => {
    if (!canSend) return;

    const content = draft.trim();
    setDraft("");
    setSending(true);
    setSendError(null);
    // 낙관적으로 내 메시지를 먼저 붙이고, 응답이 오면 AI 답변을 이어 붙인다.
    setMessages((prev) => [...prev, { role: "MEMBER", content, createdAt: new Date().toISOString() }]);

    try {
      const reply = await consultation.sendMessage(data.consultationId, content);
      setMessages((prev) => [...prev, reply]);
    } catch (err) {
      setSendError(toErrorMessage(err, "메시지를 보내지 못했습니다."));
    } finally {
      setSending(false);
    }
  };

  const handleHandoff = async () => {
    setContactOpen(true);
    if (!data?.consultationId) return;
    try {
      await consultation.handoff(data.consultationId);
    } catch {
      // 연결 요청 기록에 실패해도 안내 모달은 그대로 보여준다.
    }
  };

  return (
    <Page>
      <Body>
        <TitleRow>
          <PageTitle>AI 컨시어지 상담</PageTitle>
          <Button type="button" onClick={handleHandoff}>
            상담원 연결
          </Button>
        </TitleRow>

        <Content>
          <CaseStrip>
            {caseInfo.map((item) => (
              <CaseField key={item.label}>
                <CaseLabel>{item.label}</CaseLabel>
                <CaseValue>{item.value}</CaseValue>
              </CaseField>
            ))}
          </CaseStrip>

          <ChatBox>
            {loading && <StateText>상담을 준비하는 중…</StateText>}
            {!loading && error && <StateText>{toErrorMessage(error, "상담을 시작하지 못했습니다.")}</StateText>}

            {messages.map((message, index) =>
              message.role === "AI" ? (
                <AiRow key={`${message.createdAt}-${index}`}>
                  <Avatar />
                  <AiBubble>{message.content}</AiBubble>
                </AiRow>
              ) : (
                <UserRow key={`${message.createdAt}-${index}`}>
                  <UserBubble>{message.content}</UserBubble>
                </UserRow>
              ),
            )}

            {sending && <StateText>AI가 답변을 작성하는 중…</StateText>}
            {sendError && <StateText>{sendError}</StateText>}
          </ChatBox>

          <Composer>
            <ComposerInput
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="궁금하신 내용을 입력해 주세요"
              rows={3}
            />
            <ComposerFooter>
              <ComposerNote>
                AI 안내는 참고용이며, 최종 수선 가능 여부 및 비용 확정은 실물 진단 또는 상담원을 통해 진행됩니다.
              </ComposerNote>
              <Button type="button" disabled={!canSend} onClick={handleSend}>
                전송
              </Button>
            </ComposerFooter>
          </Composer>
        </Content>
      </Body>

      <AgentContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
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

const TitleRow = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const PageTitle = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #222;
`;

const Content = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Panel = css`
  width: 100%;
  box-sizing: border-box;
  background: #fff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
`;

const CaseStrip = styled.div`
  ${Panel}
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
  padding: 16px 24px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CaseField = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const CaseLabel = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 16.5px;
  letter-spacing: 0.88px;
  text-transform: uppercase;
  color: #919191;
`;

const CaseValue = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 500;
  line-height: 19.5px;
  color: #222;
`;

const ChatBox = styled.div`
  ${Panel}
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px;
  overflow: hidden;
`;

const StateText = styled.p`
  width: 100%;
  margin: 0;
  font-size: 13px;
  line-height: 21.125px;
  color: #919191;
`;

const AiRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const Avatar = styled.div`
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  background: #222;
  border-radius: 999px;
`;

const AiBubble = styled.p`
  flex: 1 1 0;
  min-width: 0;
  margin: 0;
  padding: 12px 16px;
  box-sizing: border-box;
  background: #f0f0f0;
  border: 1px solid #d1d5db;
  border-radius: 4px 16px 16px 16px;
  font-size: 13px;
  line-height: 21.125px;
  color: #222;
`;

const UserRow = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
`;

const UserBubble = styled.p`
  max-width: 80%;
  margin: 0;
  padding: 12px 16px;
  box-sizing: border-box;
  background: #222;
  border-radius: 16px 4px 16px 16px;
  font-size: 13px;
  line-height: 21.125px;
  color: #fff;
`;

const Composer = styled.div`
  ${Panel}
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
`;

const ComposerInput = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 59px;
  padding: 0;
  border: none;
  background: none;
  resize: none;
  font-family: inherit;
  font-size: 13px;
  line-height: 19.5px;
  color: #222;

  &::placeholder {
    color: #919191;
  }

  &:focus {
    outline: none;
  }
`;

const ComposerFooter = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid #d1d5db;
`;

const ComposerNote = styled.p`
  min-width: 0;
  margin: 0;
  font-size: 11px;
  line-height: 17.875px;
  color: #919191;
`;
