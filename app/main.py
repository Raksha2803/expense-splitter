from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routes_users import router as users_router
from app.routes_groups import router as groups_router
from app.routes_expenses import router as expenses_router
from app.routes_auth import router as auth_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users_router)
app.include_router(groups_router)
app.include_router(expenses_router)
app.include_router(auth_router)

@app.get("/")
def health_check():
    return {"status": "ok"}