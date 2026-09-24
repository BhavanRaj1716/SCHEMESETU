from datetime import datetime

from app.schemas.common import CamelModel
from app.schemas.recommend import RecommendRequest, RecommendResponse
from app.schemas.scheme import SchemeSummary


class SavedSchemeOut(CamelModel):
    id: str
    scheme: SchemeSummary
    created_at: datetime


class SavedSchemeListResponse(CamelModel):
    saved_schemes: list[SavedSchemeOut]
    count: int


class SaveSchemeRequest(CamelModel):
    scheme_id: str


class SavedRecommendationCreate(CamelModel):
    request: RecommendRequest
    response: RecommendResponse


class SavedRecommendationOut(CamelModel):
    id: str
    request_id: str
    request: RecommendRequest
    response: RecommendResponse
    created_at: datetime


class SavedRecommendationListResponse(CamelModel):
    saved_recommendations: list[SavedRecommendationOut]
    count: int
