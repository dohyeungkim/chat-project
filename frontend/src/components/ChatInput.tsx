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
    alert("파일을 먼저 선택하세요!");
    return;
  }
  try {
    console.log("[FRONT][업로드 시작] file 객체:", file);
    const data = await sendFileMessage(roomId, file);
    console.log("[FRONT][업로드 응답] 서버 반환값:", data);
    onSend({ type: "file", content: data.content });
    setFile(null);
  } catch (err) {
    console.error("[FRONT][업로드 에러]:", err);
    alert("파일 업로드 실패: " + String(err));
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