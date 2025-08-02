from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import messages
from . import rooms                        # rooms 라우터 추가 등록!
from . import users                        # users 라우터 추가 등록!
from fastapi.staticfiles import StaticFiles

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(users.router, prefix="/api")
app.include_router(rooms.router, prefix="/api")
app.include_router(messages.router, prefix="/api")

app.mount("/static", StaticFiles(directory="uploaded_files"), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://reliable-creponne-b6d576.netlify.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)