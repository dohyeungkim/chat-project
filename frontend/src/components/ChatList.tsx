import React from "react";
import { Message } from "../types/Message";

interface Props {
  messages: Message[];
}

const API_URL = "https://chat-project-1-av9p.onrender.com";

const ChatList: React.FC<Props> = ({ messages }) => (
  <div>
    {messages.map((msg, idx) => {
      // 파일 메시지라면 uuid_뒤의 "실제 원본 파일명"을 추출
      let filename = undefined;
      if (msg.type === "file" && msg.content) {
        const split = msg.content.split("_");
        if (split.length > 1) {
          filename = decodeURIComponent(split.slice(1).join("_"));
        } else {
          filename = decodeURIComponent(msg.content);
        }
      }
      // 파일 다운로드 url – 서버 파일 다운로드 엔드포인트에 맞춤!
      const fileUrl =
        msg.type === "file" && msg.content
          ? `${API_URL}/messages/file/${encodeURIComponent(msg.content)}`
          : "";

      return (
        <div key={msg.id ?? msg.created_at ?? `${msg.sender}_${idx}`}>
          <span>
            [{msg.type}] {msg.sender}:
          </span>{" "}
          {msg.type === "file" && msg.content ? (
            <a
              href={fileUrl}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "blue", textDecoration: "underline" }}
            >
              {filename || "파일 다운로드"}
            </a>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      );
    })}
  </div>
);

export default ChatList;


