import React, { useState } from "react";
import { sendFileMessage } from "../api/chat";

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
    setIsUploading(true);
    try {
      const data = await sendFileMessage(roomId, file);
      onSend({ type: "file", content: data.content });
      setFile(null);
    } catch (err) {
      alert("파일 업로드 실패: " + String(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="chatroom-input-box">
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="메시지 입력"
        onKeyDown={e => { if (e.key === "Enter") handleTextSend(); }}
        disabled={isUploading}
      />
      <input
        type="file"
        style={{ display: "none" }}
        id="file-upload"
        onChange={e => setFile(e.target.files?.[0] || null)}
        accept="*"
        disabled={isUploading}
      />
      <label htmlFor="file-upload" className="file-upload-label">
        📁
      </label>
      {file && (
        <span className="selected-file">{file.name}</span>
      )}
      <button onClick={handleTextSend} disabled={isUploading}>전송</button>
      <button onClick={handleFileSend} disabled={isUploading || !file}>파일 전송</button>
    </div>
  );
};

export default ChatInput;
