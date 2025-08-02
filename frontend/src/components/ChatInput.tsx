import React, { Dispatch, SetStateAction, useState } from "react";
import { sendTextMessage, sendFileMessage } from "../api/chat";
import { getToken, decodeToken } from "../utils/jwt";

interface Props {
  roomId: number;
  onSend: () => void;
  refresh: boolean;
  setRefresh: Dispatch<SetStateAction<boolean>>;
}

const ChatInput: React.FC<Props> = ({ roomId, onSend, refresh, setRefresh }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const token = getToken();
  const userInfo = decodeToken(token);

  if (!userInfo) return <div>로그인이 필요합니다.</div>;

  // 예: 유저 role 정보 및 이름 표시
  const username = userInfo.username || "";
  const role = userInfo.role || "";

  const handleSend = async () => {
    if (!text.trim() && !file) return;
    try {
      if(file && text.trim()) {
        await sendTextMessage(roomId, text);
        await sendFileMessage(roomId, file);
      } else if(file) {
        await sendFileMessage(roomId, file);
      } else if(text.trim()) {
        await sendTextMessage(roomId, text);
      }
      setText("");
      setFile(null);
      setRefresh((prev) => !prev);
      onSend();
    } catch (err: any) {
      if (err.message === "인증 필요") {
        alert("인증 정보가 없어 자동 로그아웃합니다.");
        localStorage.clear();
        window.location.href = "/login";
      } else {
        alert("메시지 전송 실패");
      }
    }
  };

  return (
    <div>
      <div>
        로그인 계정: <b>{role ? `${role} (${username})` : username}</b>
      </div>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="메시지 입력"
      />
      <input
        type="file"
        onChange={e => setFile(e.target.files?.[0] || null)}
      />
      <button onClick={handleSend}>보내기</button>
    </div>
  );
};

export default ChatInput;