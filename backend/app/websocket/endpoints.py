from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from app.websocket.manager import ConnectionManager  
from jose import JWTError, jwt
from app import models
from app.users import get_db
from app import models
import os
import json  # <- 꼭 추가!

router = APIRouter()
manager = ConnectionManager()
STATIC_BASE_URL = "https://chat-project-1-av9p.onrender.com/static"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def extract_user_from_token(token: str, db) -> models.User:
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        return user
    except JWTError:
        return None

@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: str, token: str = Query(...)):
    db = next(get_db())
    try:
        # 1. 토큰(인증) 및 유저 추출
        user = extract_user_from_token(token, db)
        if not user:
            print(f"[WS] JWT 인증 실패(token={token[:12]}...)")
            await websocket.close(code=4001)
            return
        # 2. 방 존재/유저 참가자 검사
        room = db.query(models.Room).filter(models.Room.id == int(room_id)).first()
        if not room:
            print(f"[WS] 방 {room_id} 없음")
            await websocket.close(code=4003)
            return
        user_ids = [u.id for u in room.users]
        if user.id not in user_ids:
            print(f"[WS] 유저 {user.username}({user.id})는 방 참가자 X. 참가자: {user_ids}")
            await websocket.close(code=4003)
            return

        print(f"[WS] 유저 {user.username}({user.id}) in 방 {room_id} 입장성공")
        await manager.connect(websocket, room_id)
        try:
            while True:
                raw_data = await websocket.receive_text()
                try:
                    data = json.loads(raw_data)
                    msg_type = data.get("type")
                    content = data.get("content")
                    sender = user.username
                    # 파일형이면 content url 수정
                    if msg_type == "file" and content and not content.startswith("http"):
                        content = f"{STATIC_BASE_URL}/{content}"
                    message = {
                        "room_id": int(room_id),
                        "sender": sender,
                        "type": msg_type,
                        "content": content,
                    }
                    # 메시지 브로드캐스트
                    await manager.broadcast(json.dumps(message), room_id)
                except Exception as e:
                    print(f"[WS] 메시지 파싱/브로드캐스트 에러: {e} (raw: {raw_data})")
        except WebSocketDisconnect:
            print(f"[WS] 유저 {user.username}({user.id}) 방 {room_id} 연결끊김")
            manager.disconnect(websocket, room_id)
        except Exception as e:
            print(f"[WS] 예상치 못한 에러: {e}")
    finally:
        db.close()