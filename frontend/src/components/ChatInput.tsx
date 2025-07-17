import React, { useState } from "react";
import { Message } from "../types/Message";
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
      // 텍스트 + 파일 모두 있는 경우
      if (text.trim()) {
        const textMsg: Message = {
          id: Date.now(),
          room_id: String(roomId),
          sender: trimmed as "학생" | "교수",
          type: "text",
          text: text.trim(),
          content: text.trim(),
          created_at: new Date().toISOString(),
        };
        onSend(textMsg);
        await sendTextMessage(roomId, trimmed, text);
      }

      // 파일 업로드
      if (file) {
        const response = await sendFileMessage(roomId, trimmed, file);
        const uploadedFileName =
          typeof response === "string"
            ? response
            : await response.text(); // 혹시 string 아닌 경우

        const fileMsg: Message = {
          id: Date.now() + 1,
          room_id: String(roomId),
          sender: trimmed as "학생" | "교수",
          type: "file",
          text: undefined,
          content: uploadedFileName,
          created_at: new Date().toISOString(),
        };
        onSend(fileMsg);
      }

      setText("");
      setFile(null);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    }
  };

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
      <select value={sender} onChange={(e) => setSender(e.target.value)}>
        <option value="">보낸 사람 선택</option>
        <option value="학생">학생</option>
        <option value="교수">교수</option>
      </select>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="메시지 입력"
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleSend}>보내기</button>
    </div>
  );
};

export default ChatInput;
