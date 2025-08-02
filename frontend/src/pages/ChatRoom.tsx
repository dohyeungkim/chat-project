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
  const navigate = useNavigate();
  const token = getToken();
  const myRoomId = localStorage.getItem("room_id");

  // 1. 권한/진입 검사 (렌더 중단은 useEffect에서만)
  useEffect(() => {
    if (!token || !myRoomId) {
      navigate("/login");
    } else if (roomId !== myRoomId) {
      navigate("/");
    }
  }, [token, myRoomId, roomId, navigate]);

  // 2. 방 입장(POST) 처리
  useEffect(() => {
    if (!roomId || !token) return;
    fetch(`${API_URL}/api/rooms/${roomId}/join`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.ok) setJoined(true);
        else {
          alert("방 입장 실패(권한/토큰 문제)");
          navigate("/");
        }
      })
      .catch(() => {
        alert("방 입장 요청 오류");
        navigate("/");
      });
  }, [roomId, token, navigate]);

  // 3. 최초 입장시 only: REST API 한번 fetch!
  useEffect(() => {
    if (!roomId) return;
    fetchMessages(Number(roomId))
      .then(data => setMessages(Array.isArray(data) ? data : data.messages))
      .catch(() => {
        alert("인증 오류(다시 로그인 필요)");
        localStorage.clear();
        navigate("/login");
      });
  }, [roomId, navigate]); // refresh 등 의존성 없이 "최초"만! (핵심)

  // 4. joined일 때만 WebSocket 연결 및 메시지 실시간 반영
  useEffect(() => {
    if (!roomId || !token || !joined) return;
    const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("[WS_RECV]", data);

        if (data.error) {
          alert("WebSocket 에러: " + data.error);
          ws.close();
          return;
        }
        if (data.echo) {
          setMessages(prev => [
            ...prev,
            {
              ...data.echo,
              sender: "me",
              created_at: new Date().toISOString(),
              // 필요 시 고유 id 생성: id: `local-${Date.now()}`
            }
          ]);
          return;
        }
        setMessages(prev => [...prev, data]);
      } catch (err) {
        console.error("WebSocket 파싱 오류:", err);
      }
    };

    ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");
    ws.onerror = (e) => {
      console.error("WebSocket 오류", e);
      alert("WebSocket 연결 중 오류 발생");
      ws.close();
    };

    return () => {
      ws.close();
    };
  }, [roomId, token, joined]);

  // 5. 메시지 전송 함수 (ws readyState, 구조 등 반드시 검증!)
  const handleSend = (msg: { type: string; content: string }) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket이 아직 연결되지 않았습니다.\n잠시 후 새로고침해 주세요.");
      return;
    }
    if (!msg || typeof msg !== "object" || !msg.type || !msg.content) {
      alert("메시지 형식 오류 (type/content 누락)");
      return;
    }
    try {
      console.log("[WS_SEND]", msg);
      ws.send(JSON.stringify(msg));
    } catch (e) {
      alert("메시지 전송 실패: " + String(e));
      console.error("메시지 전송 오류:", e);
    }
  };

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput
        roomId={Number(roomId)}
        onSend={handleSend}
      />
    </div>
  );
};

export default ChatRoom;