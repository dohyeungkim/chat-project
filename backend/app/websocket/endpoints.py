from fastapi import APIRouter, WebSocket, Query
from jose import JWTError, jwt
from sqlalchemy.orm import joinedload
from app import models
from app.users import get_db
import json
import os

router = APIRouter()
STATIC_BASE_URL = "https://chat-project-1-av9p.onrender.com/static"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def extract_user_from_token(token: str, db) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        return db.query(models.User).filter(models.User.id == user_id).first()
    except JWTError:
        return None

@router.websocket("/ws/chat/{room_id}")
async def chat_ws(websocket: WebSocket, room_id: int, token: str = Query(...)):
    db = next(get_db())
    try:
        user = extract_user_from_token(token, db)
        if not user:
            print("[WS_FAIL] JWT 인증 실패", flush=True)
            await websocket.send_json({"error": "JWT 인증 실패"})
            await websocket.close(code=4001)
            return

        # ⭐️ 관계 최신화: joinedload + db.refresh(room)
        room = db.query(models.Room)\
            .options(joinedload(models.Room.users))\
            .filter(models.Room.id == room_id).first()
        db.refresh(room)  # <--- 최신화

        user_ids = [u.id for u in room.users]
        print(f"[DEBUG] 방 {room_id} 참가자: {user_ids}, 내 id: {user.id}", flush=True)
        if user.id not in user_ids:
            print("[DEBUG] 참가자로 인식 못 함! DB 반영 미반영, 세션 불일치, 딜레이 가능성!", flush=True)
            await websocket.send_json({"error": "방 참가자가 아닙니다, 새로고침 하세요!"})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] {user.username}({user.id}) → 방 {room_id} 입장 handshake 성공", flush=True)
        # 이후 manager.connect, 메시지 송수신 등 기존 코드...

    finally:
        db.close()