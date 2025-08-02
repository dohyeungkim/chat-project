from typing import Literal, Optional, List
from pydantic import BaseModel
from datetime import datetime

class MessageCreate(BaseModel):
    room_id: int
    # sender: str  # sender가 아니라 백엔드에서 자동 지정
    type: Literal["text", "file"]
    content: Optional[str] = ""

class MessageResponse(BaseModel):
    id: int
    room_id: int
    sender: str
    type: str
    content: str
    created_at: datetime
    class Config:
        orm_mode = True

class RoomBase(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        orm_mode = True

class RoomResponse(BaseModel):
    id: int
    name: str
    class Config:
        orm_mode = True
