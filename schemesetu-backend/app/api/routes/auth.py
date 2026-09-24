from fastapi import APIRouter, Depends

from app.api.dependencies import get_current_user
from app.db.models import User
from app.schemas.auth import LogoutResponse, UserProfile
from app.schemas.common import ErrorResponse

router = APIRouter(prefix="/api", tags=["Auth"])
_401 = {401: {"model": ErrorResponse}}

# Passwords live in Firebase Authentication, never here. The frontend signs the user in with Firebase
# (email / phone OTP) and sends the Firebase ID token as `Authorization: Bearer <token>`.


@router.post("/auth/register", response_model=UserProfile, status_code=201, responses=_401, summary="Create/ensure profile for a Firebase-authenticated user")
def register(user: User = Depends(get_current_user)):
    return user


@router.post("/auth/login", response_model=UserProfile, responses=_401, summary="Verify Firebase ID token and return profile")
def login(user: User = Depends(get_current_user)):
    return user


@router.post("/auth/logout", response_model=LogoutResponse, summary="Stateless logout acknowledgement")
def logout():
    return LogoutResponse(message="Signed out. Discard the Firebase ID token on the client (firebase.auth().signOut()).")


@router.get("/users/me", response_model=UserProfile, responses=_401, summary="Current user profile")
def me(user: User = Depends(get_current_user)):
    return user
