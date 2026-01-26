from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
import uuid


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: EmailStr
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserResponse(BaseModel):
    id: str
    username: str
    email: EmailStr
    created_at: datetime


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6)
    email: EmailStr


class TokenResponse(BaseModel):
    access_token: str
    token_type: str


class Farmland(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    name: str = Field(min_length=1, max_length=100)
    area: float = Field(gt=0)
    crop_type: str = Field(min_length=1, max_length=50)
    boundary_coords: List[List[float]] = Field(min_length=3)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class FarmlandCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    area: float = Field(gt=0)
    crop_type: str = Field(min_length=1, max_length=50)
    boundary_coords: List[List[float]] = Field(min_length=3)


class FarmlandUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    area: Optional[float] = Field(None, gt=0)
    crop_type: Optional[str] = Field(None, min_length=1, max_length=50)
    boundary_coords: Optional[List[List[float]]] = Field(None, min_length=3)


class FarmlandResponse(BaseModel):
    id: str
    name: str
    area: float
    crop_type: str
    boundary_coords: List[List[float]]
    created_at: datetime
    updated_at: datetime
