import React, { useState } from "react";

export default function Signup({ onSignup }: { onSignup: () => void }) {
  const [form, setForm] = useState({ username: "", password: "", role: "학생" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("https://chat-project-1-av9p.onrender.com/api/users/auth/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("회원가입 실패");
      // room_id, token 등 필요하면 응답처리
      const { token, room_id, user } = await res.json();
      localStorage.setItem("token", token);
      localStorage.setItem("room_id", `${room_id}`);
      localStorage.setItem("username", user.username);
      onSignup();
    } catch {
      setError("회원가입에 실패했습니다.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <input name="username" placeholder="아이디" required value={form.username} onChange={handleChange} />
      <input name="password" type="password" placeholder="비밀번호" required value={form.password} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="학생">학생</option>
        <option value="교수">교수</option>
      </select>
      <button type="submit">회원가입</button>
      {error && <div style={{color:"red"}}>{error}</div>}
    </form>
  );
}