import React, { useState } from "react";

export default function Signup({ onSignup }: { onSignup: () => void }) {
  const [form, setForm] = useState({ username: "", password: "", role: "student", name: "" });
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
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "회원가입 실패");
      }
      const { token, room_id, user } = await res.json();
      localStorage.setItem("token", token);
      localStorage.setItem("room_id", `${room_id}`);
      localStorage.setItem("username", user.username);
      localStorage.setItem("role", user.role);
      localStorage.setItem("user_id", user.id);
      onSignup();
    } catch (err: any) {
      setError(err.message || "회원가입에 실패했습니다.");
    }
  };

  return (
    <div className="signup-wrap">
      <form className="signup-card" onSubmit={handleSubmit}>
        <h2 className="signup-title">회원가입</h2>
        <input
          className="signup-input"
          name="username"
          type="text"
          placeholder="아이디"
          value={form.username}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          name="password"
          type="password"
          placeholder="비밀번호"
          value={form.password}
          onChange={handleChange}
          required
        />
        <input
          className="signup-input"
          name="name"
          type="text"
          placeholder="이름"
          value={form.name}
          onChange={handleChange}
          required
        />
        <select
          className="signup-select"
          name="role"
          value={form.role}
          onChange={handleChange}
        >
          <option value="student">학생</option>
          <option value="professor">교수</option>
        </select>
        <button className="signup-btn" type="submit">회원가입</button>
        {error && <div className="signup-error">{error}</div>}
      </form>
    </div>
  );
}
