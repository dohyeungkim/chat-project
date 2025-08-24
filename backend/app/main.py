from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import messages
from . import rooms                        # rooms 라우터 추가 등록!
from . import users    # users 라우터 추가 등록!
from app.websocket import endpoints
from fastapi.staticfiles import StaticFiles

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://chat-project-2-ttox.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="uploaded_files"), name="static")

app.include_router(users.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(messages.router, prefix="/api")
app.include_router(endpoints.router)
