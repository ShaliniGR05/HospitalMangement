from passlib.context import CryptContext
from passlib.exc import UnknownHashError


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
fallback_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")


def hash_password(password: str) -> str:
    try:
        return pwd_context.hash(password)
    except Exception:
        # Fallback for environments where bcrypt backend is incompatible.
        return fallback_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    if not hashed_password:
        return False

    try:
        return pwd_context.verify(plain_password, hashed_password)
    except UnknownHashError:
        try:
            return fallback_context.verify(plain_password, hashed_password)
        except UnknownHashError:
            # Backward-compatibility path for manually inserted plaintext passwords.
            return plain_password == hashed_password
    except Exception:
        try:
            return fallback_context.verify(plain_password, hashed_password)
        except UnknownHashError:
            # Backward-compatibility path for manually inserted plaintext passwords.
            return plain_password == hashed_password


def password_needs_upgrade(stored_password: str) -> bool:
    if not stored_password:
        return True

    try:
        return pwd_context.needs_update(stored_password)
    except UnknownHashError:
        try:
            return fallback_context.needs_update(stored_password)
        except UnknownHashError:
            # If passlib cannot identify it, it is not a valid configured hash.
            return True
    except Exception:
        try:
            return fallback_context.needs_update(stored_password)
        except UnknownHashError:
            # If passlib cannot identify it, it is not a valid configured hash.
            return True
