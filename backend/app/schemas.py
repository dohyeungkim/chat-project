from typing import Literal
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class MessageCreate(BaseModel):
    room_id: int
    sender: str
    type: Literal["text", "file"]
    content: Optional[str] = ""

class MessageResponse(MessageCreate):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True
        
