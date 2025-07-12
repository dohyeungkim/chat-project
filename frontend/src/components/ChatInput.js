import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { sendTextMessage, sendFileMessage } from "../api/chat";
const ChatInput = ({ roomId, onSend }) => {
    const [sender, setSender] = useState("");
    const [text, setText] = useState("");
    const [file, setFile] = useState(null);
    const handleSend = async () => {
        const trimmedSender = sender.trim();
        if (trimmedSender !== "학생" && trimmedSender !== "교수") {
            alert("보낸 사람은 '학생' 또는 '교수'만 입력할 수 있습니다.");
            return;
        }
        if (text.trim()) {
            await sendTextMessage(roomId, sender, text);
            setText("");
        }
        if (file) {
            await sendFileMessage(roomId, sender, file);
            setFile(null);
        }
        await onSend();
    };
    return (_jsxs("div", { style: { display: "flex", gap: "0.5rem", marginTop: "1rem" }, children: [_jsxs("select", { value: sender, onChange: (e) => setSender(e.target.value), children: [_jsx("option", { value: "", children: "\uBCF4\uB0B8 \uC0AC\uB78C \uC120\uD0DD" }), _jsx("option", { value: "\uD559\uC0DD", children: "\uD559\uC0DD" }), _jsx("option", { value: "\uAD50\uC218", children: "\uAD50\uC218" })] }), _jsx("input", { value: text, onChange: e => setText(e.target.value), placeholder: "\uBA54\uC2DC\uC9C0 \uC785\uB825" }), _jsx("input", { type: "file", onChange: e => setFile(e.target.files?.[0] || null) }), _jsx("button", { onClick: handleSend, children: "\uBCF4\uB0B4\uAE30" })] }));
};
export default ChatInput;
