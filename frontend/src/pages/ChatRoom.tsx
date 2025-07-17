import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../api/chat";
import { Message } from "../types/Message";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!roomId) return;

    const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);

        // 파일 메시지 content가 /static/ 경로가 아니면 보정
        if (msg.type === "file" && typeof msg.content === "string" && !msg.content.startsWith("/static/")) {
          msg.content = `/static/${msg.content}`;
        }

        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("WebSocket 메시지 파싱 오류:", err);
      }
    };

    ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");

    return () => ws.close();
  }, [roomId, messages]);

  useEffect(() => {
    if (!roomId){
      console.error("❗roomId가 없습니다. useParams 확인 필요.");
    return;
    }

    const roomNumber = parseInt(roomId, 10);
    if (isNaN(roomNumber)) {
    console.error("❗roomId가 숫자가 아닙니다:", roomId);
    return;
  }

    // 기존 채팅 불러오기
    fetchMessages(roomNumber).then((data) => {
    setMessages(data);
    });
  }, [roomId]);

  const handleSend = (newMsg: Message) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(newMsg));
    }
  };

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput roomId={Number(roomId)} onSend={handleSend} />
    </div>
  );
};

export default ChatRoom;