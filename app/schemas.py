import uuid
from pydantic import BaseModel, EmailStr


# --- User schemas ---

class UserCreate(BaseModel):
    """What the client must send to create a user"""
    name: str
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """What we send back - notice: no password or password_hash"""
    id: uuid.UUID
    name: str
    email: EmailStr

    class Config:
        from_attributes = True  # lets Pydantic read data from SQLAlchemy objects directly


from typing import List


# --- Group schemas ---

class GroupCreate(BaseModel):
    name: str
    created_by: uuid.UUID  # the user ID of whoever is creating the group


class GroupResponse(BaseModel):
    id: uuid.UUID
    name: str
    created_by: uuid.UUID
    members: List[UserResponse] = []

    class Config:
        from_attributes = True


class AddMemberRequest(BaseModel):
    user_id: uuid.UUID


from decimal import Decimal


# --- Expense schemas ---

class SplitInput(BaseModel):
    user_id: uuid.UUID
    amount_owed: Decimal


class ExpenseCreate(BaseModel):
    group_id: uuid.UUID
    amount: Decimal
    description: str
    splits: List[SplitInput]


class SplitResponse(BaseModel):
    user_id: uuid.UUID
    amount_owed: Decimal

    class Config:
        from_attributes = True


class ExpenseResponse(BaseModel):
    id: uuid.UUID
    group_id: uuid.UUID
    paid_by: uuid.UUID
    amount: Decimal
    description: str
    splits: List[SplitResponse]

    class Config:
        from_attributes = True

# --- Auth schemas ---

class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
