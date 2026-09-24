"""One error envelope everywhere: {"error": {"code", "message", "details"}}."""
import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import OperationalError
from starlette.exceptions import HTTPException as StarletteHTTPException

log = logging.getLogger("schemesetu")


class AppError(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, details: dict | None = None):
        self.code, self.message, self.status_code, self.details = code, message, status_code, details or {}


def _body(code: str, message: str, details: dict | None = None) -> dict:
    return {"error": {"code": code, "message": message, "details": details or {}}}


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def _app_error(_: Request, exc: AppError):
        return JSONResponse(status_code=exc.status_code, content=_body(exc.code, exc.message, exc.details))

    @app.exception_handler(RequestValidationError)
    async def _validation(_: Request, exc: RequestValidationError):
        errors = exc.errors()
        first = errors[0] if errors else {}
        loc = ".".join(str(p) for p in first.get("loc", ()) if p not in ("body", "query", "path"))
        msg = str(first.get("msg", "Invalid request")).removeprefix("Value error, ")
        message = f"{loc}: {msg}" if loc else msg
        details = {"fields": [{"field": ".".join(str(p) for p in e.get("loc", ()) if p not in ("body", "query", "path")), "message": str(e.get("msg")).removeprefix("Value error, ")} for e in errors]}
        return JSONResponse(status_code=422, content=_body("INVALID_REQUEST", message, details))

    @app.exception_handler(StarletteHTTPException)
    async def _http(_: Request, exc: StarletteHTTPException):
        code = {401: "UNAUTHORIZED", 403: "FORBIDDEN"}.get(exc.status_code, "INTERNAL_ERROR" if exc.status_code >= 500 else "INVALID_REQUEST")
        return JSONResponse(status_code=exc.status_code, content=_body(code, str(exc.detail)))

    @app.exception_handler(OperationalError)
    async def _db_down(_: Request, exc: OperationalError):
        log.exception("database unavailable")
        return JSONResponse(status_code=503, content=_body("DATA_UNAVAILABLE", "The data store is currently unavailable."))

    @app.exception_handler(Exception)
    async def _unhandled(_: Request, exc: Exception):
        log.exception("unhandled error")
        return JSONResponse(status_code=500, content=_body("INTERNAL_ERROR", "An unexpected error occurred."))
