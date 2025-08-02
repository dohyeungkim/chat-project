import { getToken } from "../utils/jwt";

export const API_URL = "https://chat-project-1-av9p.onrender.com";

export async function fetchMessages(roomId?: number) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/messages?room_id=${roomId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error("인증 필요");
  return res.json();
}

export async function sendTextMessage(roomId: number, content: string) {
  const token = getToken();
  const res = await fetch(`${API_URL}/api/messages/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ room_id: roomId, type: "text", content }),
  });
  if (res.status === 401) throw new Error("인증 필요");
  return res.json();
}

export async function sendFileMessage(roomId: number, file: File) {
  const token = getToken();
  const formData = new FormData();
  formData.append("room_id", roomId.toString());
  formData.append("type", "file");
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/messages/file/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (res.status === 401) throw new Error("인증 필요");
  return res.json();
}