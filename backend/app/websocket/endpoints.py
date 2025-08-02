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

        # ORM 관계는 유지하되,
        # 중간 테이블 직접 쿼리로 참가자 관계 "최종 보호" (캐시관계, 슬로우 리플리카 대책)
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
            await websocket.send_json({"error": "방 참가자가 아닙니다(DB 기준). 새로고침 또는 재입장 이후 시도!"})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] {user.username}({user.id}) 방 {room_id} handshake 확정 통과!", flush=True)
        # 이하 생략
    finally:
        db.close()