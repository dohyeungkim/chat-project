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
        console.log("응답 user:", user);
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
    <form onSubmit={handleSubmit}>
      <h2>회원가입</h2>
      <input name="username" value={form.username} onChange={handleChange} placeholder="ID" />
      <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="비밀번호" />
      <input name="name" value={form.name} onChange={handleChange} placeholder="이름" required />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="student">학생</option>
        <option value="professor">교수</option>
      </select>
      <button type="submit">회원가입</button>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}