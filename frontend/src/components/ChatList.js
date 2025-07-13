import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const ChatList = ({ messages }) => {
    return (_jsx("div", { style: { border: "1px solid #ccc", minHeight: "300px", padding: "1rem" }, children: messages.map((msg) => {
            const fileUrl = `https://chat-project-3.onrender.com/static/${msg.content}`;
            const isImage = /\.(png|jpe?g|gif|webp|bmp)$/i.test(msg.content ?? "");
            const sender = msg.sender?.trim();
            const isProfessor = msg.sender === "교수";
            return (_jsx("div", { style: {
                    display: "flex",
                    justifyContent: isProfessor ? "flex-end" : "flex-start",
                    marginBottom: "1rem",
                }, children: _jsxs("div", { style: {
                        maxWidth: "60%",
                        backgroundColor: isProfessor ? "#d1c4e9" : "#e0f7fa",
                        padding: "10px",
                        borderRadius: "10px",
                        textAlign: "left",
                    }, children: [_jsx("div", { style: {
                                fontWeight: "bold",
                                marginBottom: "5px",
                            }, children: sender }), msg.type === "text" && msg.content && (_jsx("span", { style: { marginLeft: "0.5rem" }, children: msg.content })), msg.type === "file" && msg.content && (_jsx("div", { style: { marginTop: "0.5rem" }, children: isImage ? (_jsx("img", { src: fileUrl, alt: "\uBCF4\uB0B8 \uC774\uBBF8\uC9C0", style: { maxWidth: "200px", display: "block" } })) : (_jsxs("a", { href: fileUrl, download: true, style: { color: "blue" }, children: ["\uD83D\uDCCE \uD30C\uC77C \uB2E4\uC6B4\uB85C\uB4DC: ", msg.content] })) }))] }) }, msg.id));
        }) }));
};
export default ChatList;
