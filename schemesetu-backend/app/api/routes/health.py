from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.database import get_db
from app.schemas.health import HealthResponse

router = APIRouter(prefix="/api", tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def health(db: Session = Depends(get_db)):
    settings = get_settings()
    database, vector = "disconnected", "unavailable"
    try:
        db.execute(text("SELECT 1"))
        database = "connected"
        if db.bind.dialect.name == "postgresql":
            ok = db.execute(text("SELECT 1 FROM pg_extension WHERE extname = 'vector'")).first()
            vector = "available" if ok else "unavailable"
        else:
            vector = "fallback"  # in-process cosine search (non-PostgreSQL / tests only)
    except Exception:
        pass
    return HealthResponse(status="ok" if database == "connected" and vector != "unavailable" else "degraded",
                          database=database, vector_search=vector, version=settings.app_version)
