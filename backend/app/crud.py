from sqlalchemy.orm import Session
from . import models, schemas

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(**message.dict())
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session, room_id: int):
    return db.query(models.Message).filter(models.Message.room_id == room_id).order_by(models.Message.created_at).all()