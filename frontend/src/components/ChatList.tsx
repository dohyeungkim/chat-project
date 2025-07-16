import React from "react";
import { Message } from "../types/Message";

interface Props {
  messages: Message[];
}

const ChatList: React.FC<Props> = ({ messages }) => {
  return (
    <div style={{ border: "1px solid #ccc", minHeight: "300px", padding: "1rem" }}>
      {messages.map((msg) => {
        const fileUrl = `https://chat-project-1-av9p.onrender.com/static/${msg.content}`;
        const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(msg.content ?? "");
        const sender = msg.sender?.trim();
        const isProfessor = msg.sender === "교수";
        

        return (
          <div
            key={msg.id}
            style={{
              display: "flex",
              justifyContent: isProfessor ? "flex-end" : "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                maxWidth: "60%",
                backgroundColor: isProfessor ? "#d1c4e9" : "#e0f7fa",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "left",
              }}
            >
              {/* 발신자 이름 */}
              <div
                style={{
                  fontWeight: "bold",
                  marginBottom: "5px",
                }}
              >
                {sender}
              </div>

              {(msg.text || (msg.type === "text" && msg.content)) && (
                <span style={{ marginLeft: "0.5rem" }}>
                  {msg.text || msg.content}
                </span>
              )}
              
              {msg.type === "file" && msg.content && (
                <div style={{ marginTop: "0.5rem" }}>
                  {isImage ? (
                    <img
                      src={fileUrl}
                      alt="보낸 이미지"
                      style={{ maxWidth: "200px", display: "block" }}
                    />
                  ) : (
                    <a href={fileUrl} download style={{ color: "blue" }}>
                      📎 파일 다운로드: {msg.content}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;