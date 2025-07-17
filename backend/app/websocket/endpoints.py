from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from .manager import ConnectionManager
import json
from datetime import datetime

router = APIRouter()
manager = ConnectionManager()


@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str):
    await manager.connect(websocket)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)

            # 메시지 내용 추출
            msg_type = data.get("type")
            content = data.get("content")
            sender = data.get("sender")

            # 파일이면 content 경로 수정
            if msg_type == "file" and not content.startswith("/static/"):
                content = f"/static/{content}"

            message = {
                "id": int(datetime.now().timestamp() * 1000),  # 클라이언트가 필요로 하는 형식
                "room_id": int(room_id),
                "sender": sender,
                "type": msg_type,
                "content": content,
                "created_at": datetime.utcnow().isoformat()
            }

            await manager.broadcast(json.dumps(message))  # ✅ 문자열로 직렬화해서 전송
    except WebSocketDisconnect:
        manager.disconnect(websocket)