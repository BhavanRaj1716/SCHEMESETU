from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.errors import AppError
from app.db.database import get_db
from app.db.models import Scheme
from app.schemas.common import ErrorResponse
from app.schemas.recommend import RecommendRequest, RecommendResponse
from app.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/api/schemes", tags=["Recommendations"])


@router.post(
    "/recommend", response_model=RecommendResponse,
    responses={422: {"model": ErrorResponse}, 503: {"model": ErrorResponse}},
    summary="Semantic retrieval + deterministic eligibility checks",
)
def recommend(payload: RecommendRequest, db: Session = Depends(get_db)):
    if not db.scalar(select(func.count()).select_from(Scheme).where(Scheme.is_active.is_(True))):
        raise AppError("DATA_UNAVAILABLE", "No scheme data is loaded. Run the seed command.", 503)
    return RecommendationService(db).recommend(payload)
