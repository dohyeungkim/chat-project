import React, { useState } from "react";
import { sendTextMessage, sendFileMessage } from "../api/chat";

interface Props {
  roomId: number;
  onSend: () => void;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend }) => {
  const [sender, setSender] = useState("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSend = async () => {

    const trimmedSender = sender.trim();

    if (trimmedSender !== "학생" && trimmedSender !== "교수") {
      alert("보낸 사람은 '학생' 또는 '교수'만 입력할 수 있습니다.");
      return;
    }
    if (text.trim()) {
      await sendTextMessage(roomId, sender, text);
      setText("");
    }
    if (file) {
      await sendFileMessage(roomId, sender, file);
      setFile(null);
    }
    await onSend();
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