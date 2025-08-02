import React from "react";
import { Message } from "../types/Message";

interface Props {
  messages: Message[];
}

// idx는 반드시 map 두번째 인자로!
const ChatList: React.FC<Props> = ({ messages }) => (
  <div>
    {messages.map((msg, idx) => (
      <div key={msg.id ?? msg.created_at ?? `${msg.sender}_${idx}`}>
        <span>[{msg.type}] {msg.sender}:</span>{" "}
        {msg.type === "file" && msg.content ? (
          <a
            href={msg.content}
            download
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue", textDecoration: "underline" }}
          >
            {decodeURIComponent(
              msg.content.split("/").pop() || "파일 다운로드"
            )}
          </a>
        ) : (
          <span>{msg.content}</span>
        )}
      </div>
    ))}
  </div>
);

export default ChatList;

