from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.users import get_db
from app.dependencies import get_current_user
from .models import User, Room


router = APIRouter(prefix="/rooms")

@router.get("/", response_model=list[schemas.RoomResponse])
def get_my_rooms(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.rooms

@router.post("/{room_id}/join")
def join_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    print(f"[JOIN] 🟡 join_room 호출: user={getattr(current_user, 'id', None)}, room_id={room_id}", flush=True)

    if not current_user:
        print("[JOIN_FAIL] 🔴 토큰 인증 실패", flush=True)
        raise HTTPException(status_code=401, detail="인증 필요")

    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        print(f"[JOIN_FAIL] 🔴 방 {room_id} 없음", flush=True)
        raise HTTPException(status_code=404, detail="존재하지 않는 방")

    if any(u.id == current_user.id for u in room.users):
        print(f"[JOIN] 🟢 이미 참가한 유저 {current_user.id} 방 {room_id}", flush=True)
        return {"detail": "이미 참가함"}

    print(f"[JOIN] 🟢 참가 추가: {current_user.id} to room {room_id}", flush=True)
    room.users.append(current_user)
    db.commit()
    print(f"[JOIN] ✅ 참가 커밋 완료!", flush=True)
    return {"detail": "참가 완료"}