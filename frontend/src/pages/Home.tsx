import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// User 타입 정의
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
  const [list, setList] = useState<User[]>([]);

  // 유저 리스트 불러오기
  useEffect(() => {
    if (!token) return;
    const apiPath = role === "student" ? "professors" : "students";
    fetch(`https://chat-project-1-av9p.onrender.com/api/users/${apiPath}/`)
      .then(res => res.json())
      .then(data => setList(data));
  }, [token, role]);

  // 방 입장 or 생성 처리
  const handleChat = async (targetUser: User) => {
    const userId = localStorage.getItem("user_id");

    // 1️⃣ 자기 자신과의 채팅 방지
    if (String(userId) === String(targetUser.id)) {
      alert("자기 자신과는 채팅할 수 없습니다.");
      return;
    }

    // 2️⃣ 역할에 맞게 student/professor id 설정
    const studentId = role === "student" ? userId : targetUser.id;
    const professorId = role === "professor" ? userId : targetUser.id;

    // 3️⃣ 값 체크
    if (!studentId || !professorId) {
      alert("필수 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    // 4️⃣ 방 조회·생성 요청
    const res = await fetch(
      `https://chat-project-1-av9p.onrender.com/api/rooms/get-or-create?student_id=${studentId}&professor_id=${professorId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
      alert("방 생성/입장에 실패했습니다. (권한 문제 또는 서버 오류)");
      return;
    }

    const room = await res.json();

    // 5️⃣ 방 정보 제대로 왔는지 체크
    if (!room.id) {
      alert("방 정보가 올바르지 않습니다. 관리자에게 문의하세요.");
      return;
    }

    localStorage.setItem("room_id", String(room.id));
    navigate(`/chat/${room.id}`);
  };

  // 로그아웃
  const handleLogout = () => {
    localStorage.clear();
    location.reload();
  };

  // 로그인 안 된 경우
  if (!token) {
    return (
      <div className="home-outer">
        <div className="home-card">
          <h2>홈</h2>
          <div className="home-btn-row">
            <button className="home-btn" onClick={() => navigate("/login")}>로그인</button>
            <button className="home-btn" onClick={() => navigate("/signup")}>회원가입</button>
          </div>
        </div>
      </div>
    );
  }

  // 홈 메인 UI (자기 자신 빼고 목록 출력)
  return (
    <div className="home-outer">
      <div className="home-card">
        <div className="home-header">
          <h2>홈</h2>
          <button className="home-logout" onClick={handleLogout}>로그아웃</button>
        </div>
        <div className="home-list-title">
          {role === "student" ? "교수 목록" : "학생 목록"}
        </div>
        <ul className="home-user-list">
          {list
            .filter(user => String(user.id) !== String(userId)) // 자기 자신 제외
            .map(user => (
              <li key={user.id} className="home-user-item">
                <div>
                  <span className="home-user-name">{user.name}</span>
                  <span className="home-user-username">({user.username})</span>
                </div>
                <button
                  className="home-chat-btn"
                  onClick={() => handleChat(user)}
                >채팅하기</button>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
