import React from "react";
import { Message } from "../types/Message";

const API_URL = "https://chat-project-1-av9p.onrender.com";

interface Props {
  messages: Message[];
}

const ChatList: React.FC<Props> = ({ messages }) => (
  <div className="message-list">
    {messages.map((msg, idx) => {
      let filename: string | undefined = undefined;
      if (msg.type === "file" && msg.content) {
        const split = msg.content.split("_");
        filename = split.length > 1
          ? decodeURIComponent(split.slice(1).join("_"))
          : decodeURIComponent(msg.content);
      }
      const fileUrl = msg.type === "file" && msg.content
        ? `${API_URL}/api/messages/file/${encodeURIComponent(msg.content)}`
        : "";

      return (
        <div
          key={idx}
          className={`message ${msg.sender === "me" ? "my-message" : "other-message"}`}
        >
          {msg.type === "file" && fileUrl ? (
            <>
              <span className="file-label">📁 {filename || "파일 다운로드"}</span>
              <a
                href={fileUrl}
                className="file-download"
                target="_blank" rel="noopener noreferrer"
                download={filename}
              >
                ⬇️ 다운로드
              </a>
            </>
          ) : (
            <span>{msg.content}</span>
          )}
        </div>
      );
    })}
  </div>
);

export default ChatList;
