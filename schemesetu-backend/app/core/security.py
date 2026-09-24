"""Auth abstraction.

The frontend authenticates users with Firebase Authentication. This backend only
VERIFIES Firebase ID tokens (Authorization: Bearer <idToken>). It never stores or
checks passwords.
"""
from dataclasses import dataclass

from app.core.config import get_settings


class AuthError(Exception):
    def __init__(self, message: str, code: str = "UNAUTHORIZED"):
        super().__init__(message)
        self.message = message
        self.code = code


@dataclass
class AuthenticatedUser:
    uid: str
    email: str | None = None
    phone: str | None = None
    display_name: str | None = None


class TokenVerifier:
    def verify(self, token: str) -> AuthenticatedUser:  # pragma: no cover - interface
        raise NotImplementedError


class DisabledVerifier(TokenVerifier):
    def verify(self, token: str) -> AuthenticatedUser:
        raise AuthError("Authentication is not enabled on this server (AUTH_MODE=none).")


class DevVerifier(TokenVerifier):
    """LOCAL DEVELOPMENT ONLY. Trusts whatever bearer token the client sends as a user id, with no
    password or signature check. Lets a frontend dev exercise saved-schemes/profile flows before
    Firebase is wired up. Refuses to run when AUTH_MODE=dev is combined with APP_ENV=production -
    this verifier must never reach a real deployment.
    """

    def __init__(self) -> None:
        if get_settings().app_env == "production":
            raise RuntimeError("AUTH_MODE=dev is not allowed when APP_ENV=production. Use AUTH_MODE=firebase.")

    def verify(self, token: str) -> AuthenticatedUser:
        token = token.strip()
        if not token:
            raise AuthError("Empty bearer token.")
        # Convention: "dev:<uid>[:<email>]", or any non-empty string used as the uid directly.
        parts = token.split(":")
        if parts[0] == "dev" and len(parts) >= 2:
            uid, email = parts[1], (parts[2] if len(parts) > 2 else None)
        else:
            uid, email = token, None
        return AuthenticatedUser(uid=f"dev-{uid}", email=email, display_name=f"Dev user ({uid})")


class FirebaseVerifier(TokenVerifier):
    def __init__(self) -> None:
        import firebase_admin  # lazy: only needed when AUTH_MODE=firebase
        from firebase_admin import auth as fb_auth

        settings = get_settings()
        if not firebase_admin._apps:
            options = {"projectId": settings.firebase_project_id} if settings.firebase_project_id else None
            firebase_admin.initialize_app(options=options)  # uses GOOGLE_APPLICATION_CREDENTIALS / ADC
        self._auth = fb_auth

    def verify(self, token: str) -> AuthenticatedUser:
        try:
            claims = self._auth.verify_id_token(token)
        except Exception as exc:  # firebase raises several exception types
            raise AuthError("Invalid or expired ID token.") from exc
        return AuthenticatedUser(
            uid=claims["uid"],
            email=claims.get("email"),
            phone=claims.get("phone_number"),
            display_name=claims.get("name"),
        )


_verifier: TokenVerifier | None = None


def get_token_verifier() -> TokenVerifier:
    global _verifier
    if _verifier is None:
        mode = get_settings().auth_mode
        if mode == "firebase":
            _verifier = FirebaseVerifier()
        elif mode == "dev":
            _verifier = DevVerifier()
        else:
            _verifier = DisabledVerifier()
    return _verifier


def set_token_verifier(verifier: TokenVerifier | None) -> None:
    """Test hook."""
    global _verifier
    _verifier = verifier
