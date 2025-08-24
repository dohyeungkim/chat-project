import React, { useState } from "react";
import { sendFileMessage } from "../api/chat";

interface Props {
  roomId: number;
  onSend: (msg: { type: string; content: string }) => void;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend }) => {
  const [text, setText] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
// 텍스트 전송
  const handleTextSend = () => {
    console.log("📨 [ChatInput] handleTextSend 호출됨");
    if (!text.trim()) {
      console.log("❌ [ChatInput] 빈 문자열, 전송 안 함");
      alert("메시지를 입력하세요.");
      return;
    }
    console.log("📨 [ChatInput] onSend 호출 →", { type: "chat", content: text.trim() });
    onSend({ type: "chat", content: text.trim() });
    setText("");
  };

  // 파일 메시지 전송
  const handleFileSend = async () => {
    if (!file) {
      alert("파일을 먼저 선택하세요!");
      return;
    }

    setIsUploading(true);
    try {
      const data = await sendFileMessage(roomId, file);
      // file content에는 filename 정보 등이 포함되어 있음
      onSend({ type: "file", content: data.content });
      setFile(null);
    } catch (err) {
      alert("파일 업로드 실패: " + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="여기에 메시지나 코드를 붙여넣으세요"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault(); // 줄바꿈 대신 전송
          handleTextSend();
        }
      }}
      rows={4}
      style={{ flex: 1, padding: "8px", fontFamily: "monospace" }}
/>
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        accept="*"
        disabled={isUploading}
        style={{ width: 140 }}
      />
      {file && (
        <span style={{ fontSize: 12 }}>{file.name}</span>
      )}
      <button onClick={handleTextSend} disabled={isUploading || !text.trim()}>
        전송
      </button>
      <button
        onClick={handleFileSend}
        disabled={isUploading || !file}
        style={{ background: file ? "#1976d2" : "#ccc", color: "#fff", border: "none", borderRadius: 4, padding: "6px 12px" }}
      >
        파일 전송
      </button>
    </div>
  );
};

export default ChatInput;
