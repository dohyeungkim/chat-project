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
    if not current_user:
        raise HTTPException(status_code=401, detail="인증 필요")
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="존재하지 않는 방")
    if current_user in room.users:
        return {"detail": "이미 참가함"}
    room.users.append(current_user)
    db.commit()
    return {"detail": "참가 완료"}