from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional
from datetime import datetime

from app.models.user import UserRole


class LoginRequest(BaseModel):
    email: str
    password: str


class UserBase(BaseModel):
    nombre: str
    email: EmailStr
    telefono: Optional[str] = None
    role: UserRole = UserRole.client


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    nombre: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
