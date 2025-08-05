import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// 최소 유저 타입 정의
type User = {
  id: number;
  username: string;
  name: string;
  role: string;
};

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const userId = localStorage.getItem("user_id");

  console.log("role in localStorage:", role);
  const [list, setList] = useState<User[]>([]);

  // 교수/학생 목록 불러오기
  useEffect(() => {
    if (!token) return;
    const apiPath = role === "student" ? "professors" : "students";
    fetch(`https://chat-project-1-av9p.onrender.com/api/users/${apiPath}/`)
      .then(res => res.json())
      .then(data => setList(data));
  }, [token, role]);

  // 채팅하기 버튼 클릭
  const handleChat = async (targetUser: User) => {
    const userId = localStorage.getItem("user_id");
    console.log("handleChat userId:", userId, "role:", role, "targetUser.id:", targetUser.id);
    const studentId = role === "student" ? userId : targetUser.id;
    const professorId = role === "professor" ? userId : targetUser.id;
    const res = await fetch(
      `https://chat-project-1-av9p.onrender.com/api/rooms/get-or-create?student_id=${studentId}&professor_id=${professorId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const room = await res.json();
    localStorage.setItem("room_id", room.id);
    navigate(`/chat/${room.id}`);
  };

  return (
    <div>
      <h2>홈</h2>
      {!token ? (
        <>
          <button onClick={() => navigate("/login")}>로그인</button>
          <button onClick={() => navigate("/signup")}>회원가입</button>
        </>
      ) : (
        <>
          {/* 교수/학생 목록 및 "채팅하기" 기능 */}
          <h3>{role === "student" ? "교수 목록" : "학생 목록"}</h3>
          <ul>
            {list.map(user => (
              <li key={user.id}>
                {user.name} ({user.username})
                <button onClick={() => handleChat(user)}>채팅하기</button>
              </li>
            ))}
          </ul>
          <button
            onClick={() => {
              localStorage.clear();
              location.reload();
            }}
          >
            로그아웃
          </button>
        </>
      )}
    </div>
  );
}