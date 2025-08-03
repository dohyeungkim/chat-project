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
    print("----- 파일 업로드 요청 디버깅 -----", flush=True)
    print(f"[1] API 호출됨: room_id={room_id}, user={getattr(current_user, 'username', None)}", flush=True)
    print(f"[2] 파일 파라미터(file): {file}", flush=True)
    if file:
        print(f"[3] file.filename: {file.filename}", flush=True)
        abs_upload_dir = os.path.abspath(UPLOAD_DIR)
        print(f"[4] 파일 저장경로(절대): {abs_upload_dir}", flush=True)
        if not os.path.exists(abs_upload_dir):
            print(f"[WARN] 업로드 폴더 없음! {abs_upload_dir} → 새로 생성", flush=True)
            os.makedirs(abs_upload_dir, exist_ok=True)
        filename = f"{uuid.uuid4().hex}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        print(f"[5] 최종 저장 경로: {file_path}", flush=True)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        print(f"[6] 실제 파일 저장 완료: {file_path}", flush=True)
        # 저장 후 폴더 내용 보기
        filelist = os.listdir(UPLOAD_DIR)
        print(f"[7] 현재 uploaded_files 파일 목록: {filelist}", flush=True)
    else:
        print("[ERROR] file=None: 실제 파일이 전달되지 않음! 프론트 업로드 코드/네트워크탭 확인!!!", flush=True)
    print("----- 업로드 디버깅 종료 -----\n", flush=True)

    # (이하는 메시지 생성 및 저장 파트)
    message = models.Message(
        room_id=room_id,
        sender=current_user.username,
        type=type,
        content=filename if file else content,
    )
    db.add(message)
    db.commit()
    db.refresh(message)
    print(f"[8] DB 메시지 저장됨: id={message.id}, type={message.type}, content={message.content}", flush=True)
    return {
        "id": message.id,
        "room_id": message.room_id,
        "sender": message.sender,
        "type": message.type,
        "content": message.content,
        "created_at": message.created_at.isoformat(),
    }

# 파일 다운로드
@router.get("/file/{filename}")
def get_uploaded_file(filename: str):
    decoded_filename = unquote(filename)
    file_path = os.path.join(UPLOAD_DIR, decoded_filename)
    print(f"[DOWNLOAD] 파일 다운로드 요청: {file_path}", flush=True)
    if not os.path.exists(file_path):
        print(f"[DOWNLOAD] 파일 없음 (404): {decoded_filename}", flush=True)
        raise HTTPException(status_code=404, detail="File not found")
    print(f"[DOWNLOAD] 파일 다운로드 시작: {file_path}", flush=True)
    return FileResponse(path=file_path, filename=decoded_filename, media_type="application/octet-stream")