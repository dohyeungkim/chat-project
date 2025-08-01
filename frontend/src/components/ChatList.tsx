import React from "react";
import { Message } from "../types/Message";

interface Props {
  messages: Message[];
}

const ChatList: React.FC<Props> = ({ messages }) => {
  return (
    <div style={{ border: "1px solid #ccc", minHeight: "300px", padding: "1rem" }}>
      {messages.map((msg) => {
        const content = msg.content ?? "";
        const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(content);
        const sender = msg.sender?.trim();
        const isProfessor = sender === "교수";

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

              {/* 텍스트 메시지 출력 */}
              {((msg.type === "text" && content)) && (
                <span style={{ marginLeft: "0.5rem" }}>
                  {content}
                </span>
              )}

              {/* 파일 메시지 출력 */}
              {msg.type === "file" && content && (
                <div style={{ marginTop: "0.5rem" }}>
                  {isImage ? (
                    <img
                      src={content}
                      alt="보낸 이미지"
                      style={{ maxWidth: "200px", display: "block" }}
                    />
                  ) : (
                    <a href={content} download style={{ color: "blue" }}>
                      📎 파일 다운로드: {decodeURIComponent(content.split("/").pop() ?? "파일")}
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
