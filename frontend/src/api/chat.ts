const API_URL = "https://chat-project-av9p.onrender.com";

export async function fetchMessages(roomId: number) {
  const res = await fetch(`${API_URL}/messages?room_id=${roomId}`);
  return res.json();
}

export async function sendTextMessage(roomId: number, sender: string, content: string) {
  const res = await fetch(`${API_URL}/messages/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ 
      room_id: roomId, 
      sender: sender, 
      type: "text", 
      content: content || "" }),
  });

  return res.json();
}

export async function sendFileMessage(roomId: number, sender: string, file: File) {
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