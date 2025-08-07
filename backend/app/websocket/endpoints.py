from fastapi import APIRouter, WebSocket, Query
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app import models
from app.users import get_db
import json
import os
from datetime import datetime

# ConnectionManager 임포트 및 싱글톤 인스턴스 생성
from app.websocket.manager import ConnectionManager

router = APIRouter()
manager = ConnectionManager()  # 여러 커넥션을 관리할 인스턴스

STATIC_BASE_URL = "https://chat-project-1-av9p.onrender.com/static"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

def extract_user_from_token(token: str, db: Session) -> models.User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("user_id")
        user = db.query(models.User).filter(models.User.id == user_id).first()
        print(f"[WS_DEBUG] token user_id={user_id} -> user={getattr(user, 'id', None)}", flush=True)
        return user
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

        rel = db.execute(
            models.room_user_table.select().where(
                and_(
                    models.room_user_table.c.room_id == room_id,
                    models.room_user_table.c.user_id == user.id
                )
            )
        ).fetchone()

        print(f"[WS_DEBUG] 참가 관계 fetch: {rel} (room_id={room_id}, user_id={user.id})", flush=True)
        if not rel:
            print(f"[DEBUG] 참가 관계 없음! room_id={room_id}, user_id={user.id}", flush=True)
            await websocket.send_json({"error": "방 참가자가 아닙니다."})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] {user.username}({user.id}) 방 {room_id} handshake 통과!", flush=True)
        await manager.connect(websocket, str(room_id))  # ✅ 커넥션 매니저에 등록

        try:
            while True:
                try:
                    raw_data = await websocket.receive_text()
                    print(f"[WS_RECV] raw_data from {user.username}/{user.id}: {raw_data}", flush=True)
                    try:
                        data = json.loads(raw_data)
                    except Exception as e:
                        print(f"[WS_ERROR] JSON 파싱 실패: {e}, 데이터={raw_data}", flush=True)
                        await websocket.send_json({"error": "메시지 파싱 오류"})
                        continue

                    msg_type = data.get("type")
                    content = data.get("content")
                    if not msg_type or not content:
                        print(f"[WS_ERROR] type/content 누락: {data}", flush=True)
                        await websocket.send_json({"error": "type/content 빠짐!"})
                        continue

                    # 파일이면 STATIC_BASE_URL prefix 추가 (다운로드 링크 완성)
                    if msg_type == "file" and content and str(content).startswith(STATIC_BASE_URL):
                        content = content.split("/")[-1]

                    # 🚩 진짜 DB 저장
                    db_message = models.Message(
                        room_id=room_id,
                        sender=user.username,
                        type=msg_type,
                        content=content,
                        created_at=datetime.now(),
                    )
                    db.add(db_message)
                    db.commit()
                    db.refresh(db_message)
                    print(f"[WS_OK] DB 메시지 저장: id={db_message.id}, type={db_message.type}, content={db_message.content}", flush=True)

                    # 프론트에 저장된 메시지 정보 내려주기
                    response = {
                        "id": db_message.id,
                        "room_id": db_message.room_id,
                        "sender": db_message.sender,
                        "type": db_message.type,
                        "content": db_message.content,
                        "created_at": db_message.created_at.isoformat(),
                    }

                    # ✅ 모든 참여자에게 브로드캐스트!
                    await manager.broadcast(json.dumps(response), str(room_id))

                except Exception as e:
                    print(f"[WS_ERROR] 수신/처리 중 예외: {e}", flush=True)
                    await websocket.close(code=4005)
                    break

        except Exception as e:
            print(f"[WS_ERROR] ws handler 전체 예외: {e}", flush=True)
            await websocket.close(code=4006)
        finally:
            await manager.disconnect(websocket, str(room_id))  # ✅ 연결 해제
    finally:
        db.close()
