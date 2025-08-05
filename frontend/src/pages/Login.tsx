import React, { useState } from "react";

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://chat-project-1-av9p.onrender.com/api/users/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("로그인 실패");
      const { token, user, room_id } = await res.json();
      console.log("user after signup/login", user);
      localStorage.setItem("token", token);
      localStorage.setItem("room_id", `${room_id}`);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user_id", user.id); 
      onLogin();
    } catch {
      setError("로그인에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>로그인</h2>
      <input name="username" placeholder="아이디" required value={form.username} onChange={handleChange} />
      <input name="password" type="password" placeholder="비밀번호" required value={form.password} onChange={handleChange} />
      <button type="submit">로그인</button>
      {error && <div style={{color:"red"}}>{error}</div>}
    </form>
  );
}