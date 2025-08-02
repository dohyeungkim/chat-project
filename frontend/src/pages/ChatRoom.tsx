import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMessages } from "../api/chat";
import { getToken } from "../utils/jwt";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { Message } from "../types/Message";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  const token = getToken();
  const myRoomId = localStorage.getItem("room_id");

  if (!token || !myRoomId) {
    navigate("/login");
    return null;
  }

  // 내 방이 아닌데 접근시 방 입장 금지
  if (roomId !== myRoomId) {
    navigate("/");
    return null;
  }

  useEffect(() => {
    if (!roomId || !token) return;

    const ws = new WebSocket(
      `${BACKEND_WS_BASE}/ws/chat/${roomId}?token=${token}`
    );
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");
    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        setMessages((prev) => [...prev, msg]);
      } catch (err) {
        console.error("WebSocket 메시지 파싱 오류:", err);
      }
    };
    ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");
    return () => ws.close();
  }, [roomId, token, refresh]);

  useEffect(() => {
    if (!roomId) return;
    const roomNumber = parseInt(roomId, 10);
    fetchMessages(roomNumber)
      .then((data) => setMessages(data))
      .catch(() => {
        alert("인증 오류, 다시 로그인해주세요.");
        localStorage.clear();
        window.location.href = "/login";
      });
  }, [roomId, refresh]);

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput roomId={Number(roomId)} onSend={()=>{}} refresh={refresh} setRefresh={setRefresh} />
    </div>
  );
};

export default ChatRoom;