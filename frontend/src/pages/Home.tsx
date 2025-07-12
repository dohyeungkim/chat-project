import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>채팅방 선택</h1>
      <ul>
        <li><Link to="/room/1">채팅방 1번</Link></li>
        <li><Link to="/room/2">채팅방 2번</Link></li>
        <li><Link to="/room/3">채팅방 3번</Link></li>
      </ul>
    </div>
  );
}