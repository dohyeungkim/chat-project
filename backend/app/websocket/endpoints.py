from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websocket.manager import ConnectionManager  
from jose import JWTError, jwt
from app import models
import os
import json  # <- 꼭 추가!

router = APIRouter()
manager = ConnectionManager()
STATIC_BASE_URL = "https://chat-project-1-av9p.onrender.com/static"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def extract_user_from_token(token: str, db) -> models.User:
    from app import models
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        return user
    except JWTError:
        return None

@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str, token: str = Query(...)):
    from app.users import get_db
    db = next(get_db())
    try:
        user = extract_user_from_token(token, db)
        if not user:
            await websocket.close(code=4001)
            return
        room = db.query(models.Room).filter(models.Room.id == int(room_id)).first()
        if not room or user not in room.users:
            await websocket.close(code=4003)
            return

        await manager.connect(websocket, room_id)
        try:
            while True:
                raw_data = await websocket.receive_text()
                data = json.loads(raw_data)
                msg_type = data.get("type")
                content = data.get("content")
                sender = user.username
                if msg_type == "file" and not content.startswith("http"):
                    content = f"{STATIC_BASE_URL}/{content}"
                message = {
                    "room_id": int(room_id),
                    "sender": sender,
                    "type": msg_type,
                    "content": content,
                }
                await manager.broadcast(json.dumps(message), room_id)
        except WebSocketDisconnect:
            manager.disconnect(websocket, room_id)
    finally:
        db.close() 