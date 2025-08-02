from fastapi import APIRouter, WebSocket, Query
from jose import JWTError, jwt
from sqlalchemy.orm import joinedload
from sqlalchemy import and_
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

        # ⭐️ "참가자 관계"를 ORM 관계 대신 중간테이블에서 직접 확인!
        rel = db.execute(
            models.room_user_table.select().where(
                and_(
                    models.room_user_table.c.room_id == room_id,
                    models.room_user_table.c.user_id == user.id
                )
            )
        ).fetchone()

        if not rel:
            print(f"[DEBUG] 참가 관계 없음! room_id={room_id}, user_id={user.id}", flush=True)
            await websocket.send_json({"error": "방 참가자가 아닙니다. 방 재입장/새로고침 이후 시도!"})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] {user.username}({user.id}) 방 {room_id} handshake 통과!", flush=True)
        # ...이후 manager.connect 등 기존 WebSocket 로직 진행
    finally:
        db.close()