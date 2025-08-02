import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages, sendTextMessage, sendFileMessage } from "../api/chat";
import { Message } from "../types/Message";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";

const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  
  // 추가된 부분
  const [refresh, setRefresh] = useState<boolean>(false);

  useEffect(() => {
    if (!roomId) return;
    const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}`);
    socketRef.current = ws;

    ws.onopen = () => console.log("✅ WebSocket 연결됨");

    ws.onmessage = (event) => {
      try {
        const msg: Message = JSON.parse(event.data);
        if (msg.type === "file") {
          console.log("파일 URL:", msg.content);  // 여기가 적용 위치입니다
        }
        setMessages((prev) => [...prev, msg]); 
      } catch (err) {
        console.error("WebSocket 메시지 파싱 오류:", err);
      }
    };

    ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");

    return () => ws.close();
  }, [roomId, refresh]);

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

  }, [roomId, refresh]);

  const handleSend = async (newMsg: Message, file?: File) => {
    const roomNumber = Number(roomId);
    if (newMsg.type === "text") {
      setMessages((prev) => [...prev, newMsg]);
      await sendTextMessage(roomNumber, newMsg.sender, newMsg.content || "");
    } else if (newMsg.type === "file" && file) {
      // 파일 메시지는 서버에서 저장 및 WebSocket broadcast 처리
      const response = await sendFileMessage(roomNumber, newMsg.sender, file);

      // 서버에서 broadcast 되므로 클라이언트는 따로 추가할 필요 없음
    }

    setRefresh((prev: boolean)  => !prev);
  };

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput roomId={Number(roomId)} onSend={handleSend} refresh={refresh} setRefresh={setRefresh} />
    </div>
  );
};

export default ChatRoom;