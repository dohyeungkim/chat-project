from sqlalchemy import Column, Integer, String, Text, DateTime, Table, ForeignKey
from sqlalchemy.sql import func
from .database import Base
from sqlalchemy.orm import relationship

# 방-유저 다대다 테이블 (중간 테이블)
room_user_table = Table(
    "room_users",
    Base.metadata,
    Column("room_id", Integer, ForeignKey("rooms.id"), primary_key=True),
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    users = relationship("User", secondary=room_user_table, back_populates="rooms")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    name = Column(String)
    rooms = relationship("Room", secondary=room_user_table, back_populates="users")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    room_id = Column(Integer, nullable=False)
    sender = Column(String, nullable=False)
    type = Column(String, default="text", nullable=False) # "text", "file"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)