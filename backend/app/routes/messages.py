from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
import shutil
import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app import crud, schemas, models
from app.users import get_db
from app.dependencies import get_current_user
from urllib.parse import unquote

router = APIRouter(prefix="/messages")
UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# 메시지 작성 (권한 체크 + sender 강제)
@router.post("/", response_model=schemas.MessageResponse)
def post_message(
    message: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.query(models.Room).filter(models.Room.id == message.room_id).first()
    if not room or current_user not in room.users:
        raise HTTPException(status_code=403, detail="채팅방 참가자가 아닙니다.")
    # sender는 인증유저
    message_data = message.dict()
    message_data['sender'] = current_user.username
    return crud.create_message(db, schemas.MessageCreate(**message_data))

# 메시지 조회 (참가자만 가능)
@router.get("/", response_model=list[schemas.MessageResponse])
def get_messages(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room or current_user not in room.users:
        raise HTTPException(status_code=403, detail="접근 권한이 없습니다.")
    return crud.get_messages(db, room_id)

# 파일 업로드 (file 메시지)
@router.post("/file/")
def upload_file_message(
    room_id: int = Form(...),
    type: str = Form(...),
    content: Optional[str] = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    room = db.query(models.Room).filter(models.Room.id == room_id).first()
    if not room or current_user not in room.users:
        raise HTTPException(status_code=403, detail="채팅방 참가자가 아닙니다.")

    filename = ""
    if file:
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    message = models.Message(
        room_id=room_id,
        sender=current_user.username,
        type=type,
        content=filename or content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return {
        "id": message.id,
        "room_id": message.room_id,
        "sender": message.sender,
        "type": message.type,
        "content": filename and f"{filename}",
        "created_at": message.created_at.isoformat(),
    }

# 파일 다운로드
@router.get("/file/{filename}")
def get_uploaded_file(filename: str):
    decoded_filename = unquote(filename)
    file_path = os.path.join(UPLOAD_DIR, decoded_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=file_path, filename=decoded_filename, media_type="application/octet-stream")