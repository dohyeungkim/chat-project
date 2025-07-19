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

  try {
    if (file && text.trim()) {
      await sendTextMessage(roomId, trimmed, text);
      await sendFileMessage(roomId, trimmed, file);
    } else if (file) {
      await sendFileMessage(roomId, trimmed, file);
    } else if (text.trim()) {
      await sendTextMessage(roomId, trimmed, text);
    }
    setText("");
    setFile(null);
  } catch (err) {
    console.error("메시지 전송 오류:", err);
  }
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