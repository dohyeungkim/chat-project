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
  const [file, setFile] = useState<File | undefined>(undefined);

  const handleSend = async () => {
    const trimmed = sender.trim();

    if (trimmed !== "학생" && trimmed !== "교수") {
      alert("보낸 사람은 '학생' 또는 '교수'만 입력할 수 있습니다.");
      return;
    }

    if (!text.trim() && !file) return; // 둘 다 없으면 무시

    try {
      // 텍스트 메시지 전송
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

      // 파일 메시지 전송
      if (file) {
        const fileMsg: Message = {
          id: Date.now() + 1,
          room_id: String(roomId),
          sender: trimmed as "학생" | "교수",
          type: "file",
          text: undefined,
          content: file.name,
          created_at: new Date().toISOString(),
        };

        onSend(fileMsg);
        await sendFileMessage(roomId, trimmed, file);
      }

      // 입력 초기화
      setText("");
      setFile(undefined);
    } catch (err) {
      console.error("메시지 전송 실패:", err);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="보낸 사람 (학생 또는 교수)"
        value={sender}
        onChange={(e) => setSender(e.target.value)}
      />
      <input
        type="text"
        placeholder="메시지를 입력하세요"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
};

export default ChatInput;