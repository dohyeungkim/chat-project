from passlib.context import CryptContext
from sqlalchemy.orm import Session
from . import models, schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session, room_id: int):
    return db.query(models.Message).filter(models.Message.room_id == room_id).order_by(models.Message.created_at).all()

def create_user(db: Session, username: str, password: str, role: str, name: str):
    hashed = pwd_context.hash(password)
    db_user = models.User(username=username, password_hash=hashed, role=role, name=name)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = db.query(models.User).filter(models.User.username == username).first()
    if user and pwd_context.verify(password, user.password_hash):
        return user
    return None