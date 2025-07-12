from fastapi import APIRouter, Depends, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi import HTTPException
import shutil
import os
import uuid
from typing import Optional
from sqlalchemy.orm import Session
from app import crud, schemas, models
from ..database import SessionLocal
from urllib.parse import unquote 


router = APIRouter(prefix="/messages")

UPLOAD_DIR = "uploaded_files"
os.makedirs(UPLOAD_DIR, exist_ok=True)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=schemas.MessageResponse)
def post_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(db, message)

@router.get("/", response_model=list[schemas.MessageResponse])
def get_messages(room_id: int, db: Session = Depends(get_db)):
    return crud.get_messages(db, room_id)

@router.post("/file/")
def upload_file_message(
    room_id: int = Form(...),
    sender: Optional[str] = Form(None),
    type: str = Form(...),
    content: Optional[str] = Form(""),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
):
    filename = ""

    if file:  # 파일이 존재할 경우에만 저장
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    message = models.Message(
        room_id=room_id,
        sender=sender,
        type=type,
        content=filename or content,  # 파일 없으면 텍스트
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    return message


@router.get("/file/{filename}")
def get_uploaded_file(filename: str):
    decoded_filename = unquote(filename)
    file_path = os.path.join(UPLOAD_DIR, decoded_filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(path=file_path, filename=filename)