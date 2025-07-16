import React, { useState } from "react";
import { Message } from "../types/Message"
import { sendTextMessage, sendFileMessage } from "../api/chat";

interface Props {
  roomId: number;
  onSend: (message: Message) => void;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend }) => {
  const [sender, setSender] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSend = async () => {
  const trimmed = sender.trim();
  if (trimmed !== "학생" && trimmed !== "교수") {
    alert("보낸 사람은 '학생' 또는 '교수'만 입력할 수 있습니다.");
    return;
  }

  if (!text.trim() && !file) return;

  let contentToSend = text.trim();

  // 파일 있을 경우 업로드 먼저 처리
  if (file) {
    try {
      const uploaded = await sendFileMessage(roomId, trimmed, file); // 업로드된 실제 파일명
      contentToSend = uploaded; // 서버에 저장된 파일명으로 교체
    } catch (err) {
      console.error("파일 업로드 실패", err);
      return;
    }
  }

  const newMsg: Message = {
    id: Date.now(),
    room_id: String(roomId),
    sender: trimmed as "학생" | "교수",
    type: file ? "file" : "text",
    text: text.trim() || undefined,
    content: contentToSend,
    created_at: new Date().toISOString(),
  };

  onSend(newMsg); // WebSocket 전송
  setText("");
  setFile(null);
};

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
      <select value={sender} onChange={(e) => setSender(e.target.value)}>
        <option value="">보낸 사람 선택</option>
        <option value="학생">학생</option>
        <option value="교수">교수</option>
      </select>
      <input value={text} onChange={e => setText(e.target.value)} placeholder="메시지 입력" />
      <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} />
      <button onClick={handleSend}>보내기</button>
    </div>
  );
};

export default ChatInput;