from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            print(f"📩 메시지 수신: {data}")
            await manager.broadcast(f"[{room_id}] {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)