from collections.abc import Callable

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import crud
from auth.jwt_handler import decode_access_token
from database import get_db
from models import User


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _normalize_role(value: str | None) -> str:
    return str(value or "").strip().lower()


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = decode_access_token(token)
        user_id = int(payload.get("sub"))
    except (ValueError, TypeError):
        raise credentials_exception

    user = crud.get_item_by_id(db, User, user_id)
    if user is None:
        raise credentials_exception
    return user


def require_roles(*roles: str) -> Callable:
    allowed_roles = {_normalize_role(role) for role in roles}

    def role_checker(current_user=Depends(get_current_user)):
        if _normalize_role(getattr(current_user, "role", None)) not in allowed_roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return current_user

    return role_checker
