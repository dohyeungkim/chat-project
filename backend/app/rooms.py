from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.users import get_db
from app.dependencies import get_current_user

router = APIRouter(prefix="/rooms")

@router.get("/", response_model=list[schemas.RoomResponse])
def get_my_rooms(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return current_user.rooms

@router.post("/rooms/{room_id}/join")
def join_room(room_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="방이 없습니다")
    if current_user not in room.users:
        room.users.append(current_user)
        db.commit()  # 반드시 커밋
        return {"detail": "방에 참가 완료"}
    return {"detail": "이미 참가한 방"}