# main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from app import models
from app.database import engine
from app.routes import messages
from fastapi.staticfiles import StaticFiles
from app.websocket.endpoints import router as websocket_router

models.Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(messages.router)
app.mount("/static", StaticFiles(directory="uploaded_files"), name="static")
# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173","https://reliable-creponne-b6d576.netlify.app"],  # 프론트엔드 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(websocket_router)