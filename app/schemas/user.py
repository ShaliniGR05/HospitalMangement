from pydantic import BaseModel
from typing import Optional


class UserCreate(BaseModel):
    user_name: str
    password: str
    role: str


class UserLogin(BaseModel):
    user_name: str
    password: str


class UserResponse(BaseModel):
    user_id: int
    user_name: str
    role: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    user_name: Optional[str] = None
    role: Optional[str] = None
