import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../api/chat";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
const BACKEND_WS_BASE = "wss://chat-project-1-av9p.onrender.com";
const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);
    useEffect(() => {
        if (!roomId)
            return;
        const ws = new WebSocket(`${BACKEND_WS_BASE}/ws/chat/${roomId}`);
        socketRef.current = ws;
        ws.onopen = () => console.log("✅ WebSocket 연결됨");
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setMessages((prev) => [...prev, data]);
        };
        ws.onclose = () => console.log("🔌 WebSocket 연결 종료됨");
        return () => ws.close();
    }, [roomId]);
    useEffect(() => {
        if (!roomId)
            return;
        // 기존 채팅 불러오기
        fetchMessages(Number(roomId)).then((data) => {
            setMessages(data);
        });
    }, [roomId]);
    const handleSend = (newMsg) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(newMsg));
        }
    };
    return (_jsxs("div", { children: [_jsxs("h2", { children: ["\uCC44\uD305\uBC29 ", roomId] }), _jsx(ChatList, { messages: messages }), _jsx(ChatInput, { roomId: Number(roomId), onSend: handleSend })] }));
};
export default ChatRoom;
