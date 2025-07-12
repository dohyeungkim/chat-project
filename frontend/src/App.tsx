// src/App.tsx
import React from 'react'
import { Routes, Route, BrowserRouter } from 'react-router-dom'
import ChatRoom from './pages/ChatRoom'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<ChatRoom />} />
    </Routes>
    
  )
}
