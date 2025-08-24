import React from "react";
import { Message } from "../types/Message";

const API_URL = "https://chat-project-1-av9p.onrender.com";

interface Props {
  messages: Message[];
  myUsername: string;
}

const ChatList: React.FC<Props> = ({ messages, myUsername }) => (
  <div className="chat-list">
    {messages.map((msg, idx) => {
      // 파일 메시지면 파일명 추출
      let filename: string | undefined = undefined;
      if (msg.type === "file" && msg.content) {
        const split = msg.content.split("_");
        filename = split.length > 1
          ? decodeURIComponent(split.slice(1).join("_"))
          : decodeURIComponent(msg.content);
      }

      // 파일 다운로드 링크
      const fileUrl =
        msg.type === "file" && msg.content
          ? `${API_URL}/api/messages/file/${encodeURIComponent(msg.content)}`
          : "";

      console.log("메시지 원본:", msg.content);
      console.log("문자열 JSON:", JSON.stringify(msg.content));
      console.log("데이터 타입:", typeof msg.content);
    

      // 본인/상대방 구분
      const isMine = msg.sender === myUsername;

      return (
        <div
          key={msg.id || idx}
          className={`chat-message ${isMine ? "sent" : "received"}`}
        >
          <div className="message-content">
            {msg.type === "file" && fileUrl ? (
              <>
                <span role="img" aria-label="file">📁</span>{" "}
                {filename || "파일 다운로드"}
                <br />
                <a href={fileUrl} download style={{ color: "#1976d2" }}>
                  ⬇️ 다운로드
                </a>
              </>
            ) : (
              // 들여쓰기 + 줄바꿈 모두 살리기
              <pre
                style={{
                  whiteSpace: "pre-wrap", // 줄바꿈과 공백 유지
                  fontFamily: "monospace", // 고정폭 폰트로 코드 가독성 향상
                  margin: 0,               // 불필요한 여백 제거
                  wordBreak: "break-word", // 긴 단어 줄바꿈
                }}
              >
                {msg.content}
              </pre>
            )}
          </div>

          <div className="message-info">
            <span>{isMine ? "나" : msg.sender}</span>
            {msg.created_at && (
              <span className="message-time">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>
      );
    })}
  </div>
);

export default ChatList;
