from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
from auth.jwt_handler import create_access_token
from auth.password import hash_password, password_needs_upgrade, verify_password
from database import get_db
from dependencies import get_current_user
from schema import LoginRequest, TokenResponse, UserCreate, UserRead


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    existing = crud.get_user_by_username(db, payload.user_name)
    if existing:
        raise HTTPException(status_code=400, detail="user_name already exists")

    return crud.create_user(db, payload.model_dump())


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, payload.user_name)
    if not user or not verify_password(payload.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid user_name or password")

    if password_needs_upgrade(user.password):
        user.password = hash_password(payload.password)
        db.commit()
        db.refresh(user)

    token = create_access_token(subject=str(user.user_id), role=user.role)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserRead)
def me(current_user=Depends(get_current_user)):
    return current_user
