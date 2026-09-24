from datetime import datetime

from app.schemas.common import CamelModel


class UserProfile(CamelModel):
    id: str
    email: str | None = None
    phone: str | None = None
    display_name: str | None = None
    preferred_language: str | None = None
    created_at: datetime | None = None


class LogoutResponse(CamelModel):
    message: str
