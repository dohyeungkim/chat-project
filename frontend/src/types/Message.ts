export interface Message {
  id: number;
  room_id: String;
  sender: "학생" | "교수";
  type: "text" | "file";     // 주 메시지 유형 (여전히 사용 가능)
  text?: string;             // 텍스트 내용 (있을 수도 있음)
  content?: string;          // 파일 이름 (있을 수도 있음)
  created_at: string;
}