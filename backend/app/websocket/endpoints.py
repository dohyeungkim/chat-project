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
        print(f"[WS] 🟡 WebSocket 진입: room_id={room_id}, token={token[:10]}...", flush=True)

        user = extract_user_from_token(token, db)
        if not user:
            print(f"[WS_FAIL] 🔴 JWT 인증 실패(token={token[:10]}...)", flush=True)
            await websocket.send_json({"error": "JWT 인증 실패(재로그인 필요)"})
            await websocket.close(code=4001)
            return

        room = db.query(models.Room).filter(models.Room.id == int(room_id)).first()
        if not room:
            print(f"[WS_FAIL] 🔴 방 {room_id} 없음", flush=True)
            await websocket.send_json({"error": f"방 {room_id} 없음"})
            await websocket.close(code=4003)
            return

        user_ids = [u.id for u in room.users]
        print(f"[WS/DEBUG] 방 {room_id} 참가자: {user_ids}, 내ID: {user.id}", flush=True)
        if user.id not in user_ids:
            print(f"[WS_FAIL] 🔴 유저 {user.username}({user.id}) 참가자 아님(403)! 현재 참가자: {user_ids}", flush=True)
            await websocket.send_json({"error": "방 참가자가 아닙니다. join API를 통해 참가해주세요."})
            await websocket.close(code=4003)
            return

        print(f"[WS_OK] ✅ {user.username}({user.id}) 방 {room_id} WS handshake 성공", flush=True)
        await manager.connect(websocket, room_id)

        try:
            while True:
                raw_data = await websocket.receive_text()
                try:
                    data = json.loads(raw_data)
                    msg_type = data.get("type")
                    content = data.get("content")
                    sender = user.username
                    if msg_type == "file" and content and not content.startswith("http"):
                        content = f"{STATIC_BASE_URL}/{content}"
                    message = {
                        "room_id": int(room_id),
                        "sender": sender,
                        "type": msg_type,
                        "content": content,
                    }
                    await manager.broadcast(json.dumps(message), room_id)
                except Exception as e:
                    print(f"[WS_ERROR] 메시지 파싱/브로드캐스트 오류: {e} (raw: {raw_data})", flush=True)
        except WebSocketDisconnect:
            print(f"[WS_CLOSE] 유저 {user.username}({user.id}) 방 {room_id} 연결끊김", flush=True)
            manager.disconnect(websocket, room_id)
        except Exception as e:
            print(f"[WS_ERROR] 예외 발생: {e}", flush=True)
    finally:
        db.close()