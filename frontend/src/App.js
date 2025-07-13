import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import ChatRoom from './pages/ChatRoom';
import Home from './pages/Home';
export default function App() {
    return (_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/room/:roomId", element: _jsx(ChatRoom, {}) })] }));
}
