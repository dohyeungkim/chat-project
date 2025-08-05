from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from jose import jwt
from datetime import datetime, timedelta
from app import schemas, crud, models
from app.database import SessionLocal   
import os
from dotenv import load_dotenv
load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(prefix="/users")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/auth/signup/")
def auth_signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자명입니다")
    new_user = crud.create_user(db, user.username, user.password, user.role, user.name)
    access_token = jwt.encode({
        "sub": new_user.username,
        "user_id": new_user.id,
        "role": new_user.role,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }, SECRET_KEY, algorithm=ALGORITHM)
    room_name = f"{new_user.username}_room"
    room = db.query(models.Room).filter(models.Room.name == room_name).first()
    if not room:
        room = models.Room(name=room_name)
        db.add(room)
        db.commit()
        db.refresh(room)
        room.users.append(new_user)
        db.commit()
    room_id = room.id
    return {
        "token": access_token,
        "room_id": room_id,
        "user": {
            "id": new_user.id,
            "username": new_user.username,
            "role": new_user.role     # role도 같이 반환!
        }
    }

@router.post("/auth/login/")
def auth_login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.authenticate_user(db, user.username, user.password)
    if not db_user:
        raise HTTPException(status_code=401, detail="잘못된 정보입니다")
    access_token = jwt.encode({
        "sub": db_user.username,
        "user_id": db_user.id,
        "role": db_user.role,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    }, SECRET_KEY, algorithm=ALGORITHM)
    room_name = f"{db_user.username}_room"
    room = db.query(models.Room).filter(models.Room.name == room_name).first()
    if not room:
        room = models.Room(name=room_name)
        db.add(room)
        db.commit()
        db.refresh(room)
        room.users.append(db_user)
        db.commit()
    room_id = room.id
    return {
        "token": access_token,
        "room_id": room_id,
        "user": {
            "id": db_user.id,
            "username": db_user.username,
            "role": db_user.role
        }
    }
# users.py (교수/학생 목록)
@router.get("/professors/", response_model=list[schemas.UserResponse])
def get_professors(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == 'professor').all()

@router.get("/students/", response_model=list[schemas.UserResponse])
def get_students(db: Session = Depends(get_db)):
    return db.query(models.User).filter(models.User.role == 'student').all()