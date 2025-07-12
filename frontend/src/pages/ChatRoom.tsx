import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../api/chat";
import { Message } from "../types/Message";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";

const ChatRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);

  const loadMessages = async () => {
    if (!roomId) return;
    const data = await fetchMessages(Number(roomId));
    setMessages(data);
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  return (
    <div>
      <h2>채팅방 {roomId}</h2>
      <ChatList messages={messages} />
      <ChatInput roomId={Number(roomId)} onSend={loadMessages} />
    </div>
  );
};

export default ChatRoom;