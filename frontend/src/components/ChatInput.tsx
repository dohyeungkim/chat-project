import React, { Dispatch, SetStateAction, useState } from "react";

interface Props {
  roomId: number;
  onSend: (msg: { type: string; content: string }) => void;
  refresh: boolean;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend, refresh, setRefresh }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleTextSend = () => {
    if (!text.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }
    onSend({ type: "chat", content: text.trim() });
    setText("");
    setRefresh(r => !r);
  };

  const handleFileSend = async () => {
    if (!file) {
      alert("파일을 먼저 선택하세요.");
      return;
    }
    // 이 예시는 "파일이름만 ws로 전송" (백엔드에서 파일처리, 업로드 완료 후 경로/uuid 넘기는 게 더 안전!)
    onSend({ type: "file", content: file.name });
    setFile(null);
    setRefresh(r => !r);
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