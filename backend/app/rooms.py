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

@router.post("/{room_id}/join")
def join_room(
    room_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    if current_user not in room.users:
        room.users.append(current_user)
        db.commit()
    return {"message": "채팅방 입장 완료"}