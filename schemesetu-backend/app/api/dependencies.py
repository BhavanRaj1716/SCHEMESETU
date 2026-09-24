from fastapi import Depends, Header
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.errors import AppError
from app.core.security import AuthError, get_token_verifier
from app.db.database import get_db
from app.db.models import User


def get_current_user(authorization: str | None = Header(default=None), db: Session = Depends(get_db)) -> User:
    """Verify `Authorization: Bearer <Firebase ID token>` and return (creating if needed) the user profile."""
    if not authorization or not authorization.lower().startswith("bearer "):
        raise AppError("UNAUTHORIZED", "Missing bearer token.", 401)
    try:
        info = get_token_verifier().verify(authorization[7:].strip())
    except AuthError as exc:
        raise AppError(exc.code, exc.message, 401) from exc
    user = db.scalar(select(User).where(User.firebase_uid == info.uid))
    if user is None:
        user = User(firebase_uid=info.uid, email=info.email, phone=info.phone, display_name=info.display_name)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
