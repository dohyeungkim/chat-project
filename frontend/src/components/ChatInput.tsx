import React, { useState } from "react";

interface Props {
  roomId: number;
  onSend: (msg: { type: string; content: string }) => void;
}

// refresh, setRefresh 등 불필요! (실시간 반영은 ws.onmessage에서)
const ChatInput: React.FC<Props> = ({ roomId, onSend }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleTextSend = () => {
    if (!text.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }
    onSend({ type: "chat", content: text.trim() });
    setText("");
  };

  const handleFileSend = () => {
    if (!file) {
      alert("파일을 먼저 선택하세요.");
      return;
    }
    // 실제 파일 업로드는 따로 구현 필요(여기선 이름만 전송)
    onSend({ type: "file", content: file.name });
    setFile(null);
  };

  return (
    <div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="메시지 입력"
        onKeyDown={e => { if (e.key === "Enter") handleTextSend(); }}
      />
      <button onClick={handleTextSend}>전송</button>
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
        accept="*"
      />
      <button onClick={handleFileSend}>파일 전송</button>
    </div>
  );
};

export default ChatInput;