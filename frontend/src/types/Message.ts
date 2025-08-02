export interface Message {
  id?: string | number;
  room_id: number;
  sender: string; // "학생" | "교수" | 사용자 이름
  type: "text" | "file";
  content?: string;
  created_at: string;
}