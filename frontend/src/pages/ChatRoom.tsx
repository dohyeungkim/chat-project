import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMessages, API_URL } from "../api/chat";
import { getToken } from "../utils/jwt";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { Message } from "../types/Message";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState(false);    // <-- 입장 성공 상태
  const socketRef = useRef<WebSocket | null>(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const token = getToken();
  const myRoomId = localStorage.getItem("room_id");

  if (!token || !myRoomId) {
    navigate("/login");
    return null;
  }
  if (roomId !== myRoomId) {
    navigate("/");
    return null;
  }

  // 1. 먼저 방 입장(POST /api/rooms/{roomId}/join) 선행 - 성공 시 joined 상태 true
  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_URL}/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) {
          setJoined(true);
        } else {
          alert("방 입장 실패(권한/토큰 문제)");
          navigate("/");
        }
      })
      .catch(() => {
        alert("방 입장 요청 중 오류 발생");
        navigate("/");
      });
  }, [roomId, token, navigate]);

  // 2. joined==true일 때만 WebSocket 연결
  useEffect(() => {
    if (!roomId || !token || !joined) return;
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
        console.error("WebSocket 파싱 오류:", err);
      }
    };
    ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");
    return () => ws.close();
    // joined, roomId, token, refresh 바뀔 때만 재실행
  }, [roomId, token, joined, refresh]);

  useEffect(() => {
    if (!roomId) return;
    const roomNumber = parseInt(roomId, 10);
    fetchMessages(roomNumber)
      .then((data) => setMessages(Array.isArray(data) ? data : data.messages))
      .catch(() => {
        alert("인증 오류(다시 로그인 필요)");
        localStorage.clear();
        window.location.href = "/login";
      });
  }, [roomId, refresh]);

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput
        roomId={Number(roomId)}
        onSend={() => {}}
        refresh={refresh}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default ChatRoom;