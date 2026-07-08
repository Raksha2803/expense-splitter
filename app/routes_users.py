from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import bcrypt

from app.database import get_db
from app import models, schemas
from app import auth
router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Hash the plain-text password before storing it - we NEVER store raw passwords
    hashed = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed.decode("utf-8"),
    )

    db.add(new_user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Email already registered")

    db.refresh(new_user)
    return new_user

from typing import List

@router.get("/", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user