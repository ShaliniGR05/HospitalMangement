from typing import Any

from sqlalchemy import inspect
from sqlalchemy.orm import Session

from auth.password import hash_password
from models import User


def _pk_name(model: type) -> str:
    return inspect(model).primary_key[0].name


def get_user_by_username(db: Session, user_name: str) -> User | None:
    return db.query(User).filter(User.user_name == user_name).first()


def create_user(db: Session, payload: dict[str, Any]) -> User:
    data = payload.copy()
    data["password"] = hash_password(data["password"])
    user = User(**data)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, payload: dict[str, Any]) -> User | None:
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return None

    for key, value in payload.items():
        if key == "password":
            setattr(user, key, hash_password(value))
        else:
            setattr(user, key, value)

    db.commit()
    db.refresh(user)
    return user


def list_items(db: Session, model: type, skip: int = 0, limit: int = 100):
    return db.query(model).offset(skip).limit(limit).all()


def get_item_by_id(db: Session, model: type, item_id: int):
    pk = _pk_name(model)
    return db.query(model).filter(getattr(model, pk) == item_id).first()


def create_item(db: Session, model: type, payload: dict[str, Any]):
    item = model(**payload)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, model: type, item_id: int, payload: dict[str, Any]):
    item = get_item_by_id(db, model, item_id)
    if not item:
        return None

    for key, value in payload.items():
        setattr(item, key, value)

    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, model: type, item_id: int) -> bool:
    item = get_item_by_id(db, model, item_id)
    if not item:
        return False

    db.delete(item)
    db.commit()
    return True
