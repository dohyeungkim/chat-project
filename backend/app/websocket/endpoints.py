from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .manager import ConnectionManager
import json

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str):
    await manager.connect(websocket)
    try:
        while True:
            text = await websocket.receive_text()
            await manager.broadcast(text)
    except WebSocketDisconnect:
        manager.disconnect(websocket)