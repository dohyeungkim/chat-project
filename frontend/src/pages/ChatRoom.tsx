import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMessages, API_URL } from "../api/chat";
import { getToken } from "../utils/jwt";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
import { Message } from "../types/Message";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

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
      .then(data => {
        console.log("📥 [초기 불러오기] 서버에서 받은 messages:", data);
        const arr = Array.isArray(data) ? data : data.messages;
        setMessages(arr);
      })
      .catch(() => {
        alert("인증 오류(다시 로그인 필요)");
        localStorage.clear();
        navigate("/login");
      });
  }, [roomId, navigate]);

  // 상대방 정보 찾기
  useEffect(() => {
    if (!messages.length || !myUsername || !myRole) return;

    // 내 username이 아닌 sender 찾기
    const opponentUsername = messages
      .map(m => m.sender)
      .find(sender => sender !== myUsername);

    if (!opponentUsername) return;

    // 상대 목록을 내 역할 반대로 fetch
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

    const ws = new WebSocket(
      `${BACKEND_WS_BASE}/ws/chat/${roomId}?token=${token}`
    );
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ [WebSocket] 연결됨");

    ws.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 [WebSocket 수신 데이터]:", data);

        if (data.error) {
          alert("WebSocket 에러: " + data.error);
          ws.close();
          return;
        }
        setMessages(prev => {
          console.log("📝 [setMessages] 이전 상태:", prev);
          const next = [...prev, data];
          console.log("📝 [setMessages] 변경 후:", next);
          return next;
        });
      } catch (err) {
        console.error("❌ [WebSocket 파싱 오류]:", err);
      }
    };

    ws.onclose = () => console.log("🔌 [WebSocket] 연결 종료");
    ws.onerror = (e) => console.error("⚠️ [WebSocket 오류]", e);

    return () => {
      ws.close();
    };
  }, [roomId, token, joined]);

    const handleSend = (msg: { type: string; content: string }) => {
    console.log("📤 [ChatRoom] handleSend 호출됨");
    console.log("📤 [ChatRoom] 전달받은 msg:", msg);
    console.log("📤 [ChatRoom] msg.content 타입:", typeof msg.content);

    const ws = socketRef.current;
    if (!ws) {
      console.warn("⚠️ [ChatRoom] WebSocket 객체 없음");
      return;
    }
    if (ws.readyState !== WebSocket.OPEN) {
      console.warn("⚠️ [ChatRoom] WebSocket이 OPEN 상태가 아님:", ws.readyState);
      return;
    }

    try {
      ws.send(JSON.stringify(msg));
      console.log("📤 [ChatRoom] WebSocket 전송 성공:", msg);
    } catch (e) {
      console.error("❌ [ChatRoom] WebSocket 전송 실패", e);
    }
  };

  return (
  <div className="chatroom-container">
    <header className="chatroom-header">
      <span className="room-title">
        {opponent
          ? `${opponent.name}님과의 대화 (${opponent.username})`
          : `채팅방 ${roomId}`}
      </span>
    </header>
    <main className="chat-main">
      <ChatList messages={messages} myUsername={myUsername!} />
    </main>
    <footer className="chat-footer">
      <ChatInput onSend={handleSend} roomId={Number(roomId)} />
    </footer>
  </div>
);
};

export default ChatRoom;
