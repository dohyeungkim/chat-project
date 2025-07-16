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
        const sender = msg.sender?.trim();
        const isProfessor = msg.sender === "교수";
        const ext = msg.content?.split(".").pop()?.toLowerCase() || "";
        const isImage = ["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext);
        const isVideo = ["mp4", "webm", "ogg"].includes(ext);

        return (
          <div key={msg.id} style={{ display: "flex", justifyContent: isProfessor ? "flex-end" : "flex-start", marginBottom: "1rem" }}>
            <div
              style={{
                maxWidth: "60%",
                backgroundColor: isProfessor ? "#d1c4e9" : "#e0f7fa",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "left",
              }}
            >
      {/* 💬 발신자 */}
      <div style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>{msg.sender}</div>

      {/* 📝 텍스트 */}
      {msg.text && (
        <div style={{ marginBottom: "0.5rem" }}>{msg.text}</div>
      )}

      {/* 🖼️ 이미지 */}
      {msg.type === "file" && isImage && (
        <img
          src={fileUrl}
          alt="보낸 이미지"
          style={{ maxWidth: "200px", display: "block", marginBottom: "0.5rem" }}
        />
      )}

      {/* 📹 동영상 */}
      {msg.type === "file" && isVideo && (
        <video controls style={{ maxWidth: "300px", display: "block", marginBottom: "0.5rem" }}>
          <source src={fileUrl} type={`video/${ext}`} />
          동영상을 지원하지 않는 브라우저입니다.
        </video>
      )}

      {/* 📎 기타 파일 다운로드 링크 */}
      {msg.type === "file" && !isImage && !isVideo && (
        <a href={fileUrl} download style={{ color: "blue" }}>
          📎 파일 다운로드: {msg.content}
        </a>
      )}
    </div>
  </div>
);
      })}
    </div>
  );
};

export default ChatList;