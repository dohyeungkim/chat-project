import React, { useState } from "react";
import { sendFileMessage } from "../api/chat"; // 파일 업로드용 api 함수 import

interface Props {
  roomId: number;
  onSend: (msg: { type: string; content: string }) => void;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleTextSend = () => {
    if (!text.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }
    onSend({ type: "chat", content: text.trim() });
    setText("");
  };

  const handleFileSend = async () => {
    if (!file) {
      alert("파일을 먼저 선택하세요.");
      return;
    }
    setIsUploading(true);
    try {
      // 1. 파일 업로드 (백엔드 저장, DB 메시지 등록)
      const data = await sendFileMessage(roomId, file);
      // 2. ws로 파일 메시지 알림 (content: uuid_원본명)
      onSend({
        type: "file",
        content: data.content,
      });
      setFile(null);
    } catch (err) {
      alert("파일 업로드/전송 실패: " + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="메시지 입력"
        onKeyDown={e => { if (e.key === "Enter") handleTextSend(); }}
        disabled={isUploading}
      />
      <button onClick={handleTextSend} disabled={isUploading || !text.trim()}>전송</button>
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        accept="*"
        disabled={isUploading}
      />
      {file && <span style={{ marginLeft: 8 }}>{file.name}</span>}
      <button onClick={handleFileSend} disabled={isUploading || !file}>파일 전송</button>
    </div>
  );
};

export default ChatInput;