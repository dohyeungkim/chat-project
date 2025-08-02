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
  const [joined, setJoined] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();
  const token = getToken();
  const myRoomId = localStorage.getItem("room_id");

  // 필수값(nav, 렌더 중단)은 useEffect로만!
  useEffect(() => {
    if (!token || !myRoomId) {
      navigate("/login");
    } else if (roomId !== myRoomId) {
      navigate("/");
    }
  }, [token, myRoomId, roomId, navigate]);

  // 방 입장(POST) - joined true 상태 만들기
  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_URL}/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => {
      if (res.ok) setJoined(true);
      else {
        alert("방 입장 실패(권한/토큰 문제)");
        navigate("/");
      }
    }).catch(() => {
      alert("방 입장 요청 오류");
      navigate("/");
    });
  }, [roomId, token, navigate]);

  // joined==true일 때만 ws 연결
  useEffect(() => {
    if (!roomId || !token || !joined) return;
    const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");

    ws.onmessage = (event) => {
    console.log("[WS_RECV] 수신 raw:", event.data);
    try {
    const data = JSON.parse(event.data);
    if (data.error) {
      alert("WebSocket 에러: " + data.error);
      ws.close();
      return;
    }
    if (data.echo) {
      // echo 응답이면 확인 로그
      console.log("[WS_ECHO]", data.echo);
      setMessages(prev => [...prev, data.echo]);
      return;
    }
    setMessages(prev => [...prev, data]);
  } catch (err) {
    console.error("WebSocket 파싱 오류:", err);
  }
};

    ws.onclose = () => {
      console.log("🔌 WebSocket 연결 종료됨");
    };

    ws.onerror = (e) => {
      console.error("WebSocket 오류", e);
      alert("WebSocket 연결 중 오류 발생");
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [roomId, token, joined]);

  // 메시지 목록 불러오기(페이지 최초·refresh)
  useEffect(() => {
    if (!roomId) return;
    fetchMessages(Number(roomId))
      .then(data => setMessages(Array.isArray(data) ? data : data.messages))
      .catch(() => {
        alert("인증 오류(다시 로그인 필요)");
        localStorage.clear();
        navigate("/login");
      });
  }, [roomId, refresh, navigate]);

  // ChatInput에서 onSend 콜백
  const handleSend = (msg: { type: string; content: string }) => {
  const ws = socketRef.current;
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert("WebSocket 연결 안됨 (새로고침 필요)");
    return;
  }
  if (!msg.type || !msg.content) {
    alert("메시지 type/content 필수");
    return;
  }
  try {
    console.log("[WS_SEND]", msg);
    ws.send(JSON.stringify(msg));
  } catch (e) {
    alert("메시지 전송 실패: " + (e as Error).message);
    console.error("[WS_SEND_ERROR]", e);
  }
};;

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput
        roomId={Number(roomId)}
        onSend={handleSend}
        refresh={refresh}
        setRefresh={setRefresh}
      />
    </div>
  );
};

export default ChatRoom;