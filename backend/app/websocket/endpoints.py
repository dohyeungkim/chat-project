from fastapi import APIRouter, WebSocket, Query
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app import models
from app.users import get_db
import json
import os
from datetime import datetime

router = APIRouter()
STATIC_BASE_URL = "https://chat-project-1-av9p.onrender.com/static"
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# JWT에서 user 추출 함수
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
        # 1. JWT 인증
        user = extract_user_from_token(token, db)
        if not user:
            print("[WS_FAIL] JWT 인증 실패", flush=True)
            await websocket.send_json({"error": "JWT 인증 실패"})
            await websocket.close(code=4001)
            return

        # 2. 방-유저 참가자 관계 체크(중간테이블 직접조회)
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
            await websocket.send_json({"error": "방 참가자가 아닙니다. 방 재입장/새로고침 이후 시도!"})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] {user.username}({user.id}) 방 {room_id} handshake 통과!", flush=True)
        await websocket.accept()

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

                # 🔥 파일 메시지는 실제 다운로드 가능한 URL로 변환
                if msg_type == "file" and content and not str(content).startswith("http"):
                    content = f"{STATIC_BASE_URL}/{content}"

                # 당장 echo로만 내려보내지만, 나중에 브로드캐스트·DB저장도 가능!
                message = {
                    # id, room_id 등은 필요에 따라 추가
                    "room_id": int(room_id),
                    "type": msg_type,
                    "sender": user.username,
                    "content": content,
                    "created_at": datetime.now().isoformat(),
                }

                print(f"[WS_OK] 정상 메시지: {msg_type}/{content}", flush=True)
                await websocket.send_json({"echo": message})

            except Exception as e:
                print(f"[WS_ERROR] 수신/처리 중 예외: {e}", flush=True)
                await websocket.close(code=4005)
                break

    except Exception as e:
        print(f"[WS_ERROR] ws handler 전체 예외: {e}", flush=True)
        await websocket.close(code=4006)
    finally:
        db.close()