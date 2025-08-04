import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { fetchMessages, API_URL } from "../api/chat";
import { getToken } from "../utils/jwt";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { Message } from "../types/Message";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

// 사용자 타입 정의
type User = {
  id: number;
  username: string;
  name: string;
  role: string;
};

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [joined, setJoined] = useState(false);
  const [opponent, setOpponent] = useState<{ name: string; username: string } | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const navigate = useNavigate();
  const token = getToken();
  const myRoomId = localStorage.getItem("room_id");
  const myUsername = localStorage.getItem("username");
  const myRole = localStorage.getItem("role");

  // 권한/방 진입 검사
  useEffect(() => {
    if (!token || !myRoomId) {
      navigate("/login");
    } else if (roomId !== myRoomId) {
      navigate("/");
    }
  }, [token, myRoomId, roomId, navigate]);

  // 방 입장
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

  // 메시지 불러오기
  useEffect(() => {
    if (!roomId) return;
    fetchMessages(Number(roomId))
      .then(data => setMessages(Array.isArray(data) ? data : data.messages))
      .catch(() => {
        alert("인증 오류(다시 로그인 필요)");
        localStorage.clear();
        navigate("/login");
      });
  }, [roomId, navigate]);

  // 상대방 정보 찾기
  useEffect(() => {
    if (!messages.length || !myUsername || !myRole) return;

    // 내 username이 아닌 sender 찾기(=상대방 username)
    const opponentUsername = messages
      .map(m => m.sender)
      .find(sender => sender !== myUsername);

    if (!opponentUsername) return;

    // 상대 목록을 내 역할 반대로 fetch: 내가 학생이면 교수, 내가 교수면 학생 목록에서 찾기
    const targetApi =
      myRole === "student"
        ? "/api/users/professors/"
        : "/api/users/students/";

    fetch(API_URL + targetApi)
      .then(res => res.json())
      .then((users: User[]) => {
        const user = users.find(u => u.username === opponentUsername);
        setOpponent(user || null);
      });
  }, [messages, myUsername, myRole]);

  // WebSocket 연결 및 수신
  useEffect(() => {
    if (!roomId || !token || !joined) return;
    const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.error) {
          alert("WebSocket 에러: " + data.error);
          ws.close();
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

  // 메시지 전송 처리
  const handleSend = (msg: { type: string; content: string }) => {
    const ws = socketRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      alert("WebSocket이 아직 연결되지 않았습니다.\n잠시 후 새로고침해 주세요.");
      return;
    }
    if (!msg?.type || !msg?.content) {
      alert("메시지 형식 오류 (type/content 누락)");
      return;
    }
    try {
      ws.send(JSON.stringify(msg));
    } catch (e) {
      alert("메시지 전송 실패: " + String(e));
      console.error("메시지 전송 오류:", e);
    }
  };

  return (
  <div className="chatroom-container">
    <div className="chatroom-header">
      {/* 상대 이름이 있으면 표시, 없으면 기존대로 */}
      {opponent
        ? `${opponent.name}님과의 대화 (${opponent.username})`
        : `채팅방 ${roomId}`}
    </div>
    <ChatList messages={messages} />
    <ChatInput roomId={Number(roomId)} onSend={handleSend} />
  </div>
);
};

export default ChatRoom;
