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

@router.get("/get-or-create")
def get_or_create_room(
    student_id: int,
    professor_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 권한 체크: 둘 중 한 명만(둘 다거나 하나만) 요청 가능
    if current_user.id not in (student_id, professor_id):
        raise HTTPException(status_code=403, detail="권한 없음")

    # 이미 존재하는 1:1방 있나 확인
    room = db.query(Room) \
        .filter(Room.users.any(User.id == student_id)) \
        .filter(Room.users.any(User.id == professor_id)) \
        .first()
    if room:
        return {"id": room.id, "name": room.name}

    # 없으면 새로 생성
    room_name = f"room_{student_id}_{professor_id}"
    new_room = Room(name=room_name)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    student = db.query(User).filter(User.id == student_id).first()
    professor = db.query(User).filter(User.id == professor_id).first()
    if not student or not professor:
        raise HTTPException(status_code=404, detail="학생/교수 중 누락")

    new_room.users.append(student)
    new_room.users.append(professor)
    db.commit()
    db.refresh(new_room)
    return {"id": new_room.id, "name": new_room.name}