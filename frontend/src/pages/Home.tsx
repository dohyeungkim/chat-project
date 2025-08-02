import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const room_id = localStorage.getItem("room_id");

  const gotoMyRoom = () => {
    if (room_id) navigate(`/chat/${room_id}`);
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
          <button onClick={gotoMyRoom}>내 채팅방 입장</button>
          <button onClick={()=>{
            localStorage.clear();
            location.reload();
          }}>로그아웃</button>
        </>
      )}
    </div>
  );
}