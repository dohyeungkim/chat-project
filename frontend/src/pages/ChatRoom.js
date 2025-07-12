import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchMessages } from "../api/chat";
import ChatList from "../components/ChatList";
import ChatInput from "../components/ChatInput";
const ChatRoom = () => {
    const { roomId } = useParams();
    const [messages, setMessages] = useState([]);
    const loadMessages = async () => {
        if (!roomId)
            return;
        const data = await fetchMessages(Number(roomId));
        setMessages(data);
    };
    useEffect(() => {
        loadMessages();
        const interval = setInterval(loadMessages, 3000);
        return () => clearInterval(interval);
    }, [roomId]);
    return (_jsxs("div", { children: [_jsxs("h2", { children: ["\uCC44\uD305\uBC29 ", roomId] }), _jsx(ChatList, { messages: messages }), _jsx(ChatInput, { roomId: Number(roomId), onSend: loadMessages })] }));
};
export default ChatRoom;
