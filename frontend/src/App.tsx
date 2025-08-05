import React from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import ChatRoom from "./pages/ChatRoom";
import Home from "./pages/Home";
import "./App.css";

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup onSignup={()=> navigate("/")} />} />
      <Route path="/login" element={<Login onLogin={()=> navigate("/")} />} />
      <Route path="/chat/:roomId" element={<ChatRoom />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
