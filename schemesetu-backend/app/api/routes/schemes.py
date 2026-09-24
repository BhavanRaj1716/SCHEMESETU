from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.errors import AppError
from app.db.database import get_db
from app.db.models import Scheme
from app.schemas.common import ErrorResponse
from app.schemas.scheme import SchemeDetail, SchemeListResponse
from app.services import scheme_service

router = APIRouter(prefix="/api/schemes", tags=["Schemes"])


@router.get("", response_model=SchemeListResponse, summary="List verified schemes")
def list_schemes(
    category: str | None = Query(None, description='e.g. "income_generating", "education"'),
    purpose: str | None = Query(None, description="Case-insensitive text match on name/purpose/activities"),
    state: str | None = None,
    beneficiary_category: str | None = Query(None, alias="beneficiaryCategory"),
    db: Session = Depends(get_db),
):
    rows = scheme_service.list_schemes(db, category, purpose, state, beneficiary_category)
    return SchemeListResponse(schemes=[scheme_service.to_summary(s) for s in rows], count=len(rows))


@router.get("/{scheme_id}", response_model=SchemeDetail, responses={404: {"model": ErrorResponse}}, summary="Scheme detail with provenance")
def get_scheme(scheme_id: str, db: Session = Depends(get_db)):
    s = db.get(Scheme, scheme_id)
    if s is None or not s.is_active:
        raise AppError("SCHEME_NOT_FOUND", f"No scheme with id '{scheme_id}'.", 404)
    return scheme_service.to_detail(s)
