const API_URL = "https://chat-project-3.onrender.com";
export async function fetchMessages(roomId) {
    const res = await fetch(`${API_URL}/messages?room_id=${roomId}`);
    return res.json();
}
export async function sendTextMessage(roomId, sender, content) {
    const res = await fetch(`${API_URL}/messages/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            room_id: roomId,
            sender: sender,
            type: "text",
            content: content || ""
        }),
    });
    return res.json();
}
export async function sendFileMessage(roomId, sender, file) {
    const formData = new FormData();
    formData.append("room_id", String(roomId));
    formData.append("sender", sender);
    formData.append("type", "file");
    formData.append("file", file);
    return fetch(`${API_URL}/messages/file/`, {
        method: "POST",
        body: formData,
    });
}
