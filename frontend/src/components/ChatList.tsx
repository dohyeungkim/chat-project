import React from "react";
import { Message } from "../types/Message";

const ChatList: React.FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <div>
      {messages.map((msg) => {
        const content = msg.content ?? "";
        const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(content);
        const sender = msg.sender?.trim();
        return (
          <div key={msg.id} style={{ marginBottom: 10 }}>
            <b>{sender}</b> <span>({new Date(msg.created_at).toLocaleTimeString()})</span>
            {msg.type === "text" && <div>{content}</div>}
            {msg.type === "file" && content && (
              isImage
                ? <img src={content} alt="첨부이미지" width={180} />
                : <a href={content} target="_blank" rel="noopener noreferrer">
                    📎 파일 다운로드: {decodeURIComponent(content.split("/").pop() || "파일")}
                  </a>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;