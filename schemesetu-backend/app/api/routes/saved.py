"""Saved schemes / saved recommendations - a signed-in user's bookmarks and search history.

Auth-gated (Authorization: Bearer <token>; see AUTH_MODE in app/core/security.py). Not part of the
spec's minimum endpoint list, but the models existed unused (spec Sec. 22/40); this wires them up.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user
from app.api.errors import AppError
from app.db.database import get_db
from app.db.models import SavedRecommendation, SavedScheme, Scheme, User
from app.schemas.common import ErrorResponse
from app.schemas.saved import (
    SavedRecommendationCreate, SavedRecommendationListResponse, SavedRecommendationOut,
    SavedSchemeListResponse, SavedSchemeOut, SaveSchemeRequest,
)
from app.services.scheme_service import to_summary

router = APIRouter(prefix="/api/users/me", tags=["Saved"])
_401 = {401: {"model": ErrorResponse}}


@router.get("/saved-schemes", response_model=SavedSchemeListResponse, responses=_401)
def list_saved_schemes(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(SavedScheme).where(SavedScheme.user_id == user.id).order_by(SavedScheme.created_at.desc())).all()
    out = []
    for r in rows:
        scheme = db.get(Scheme, r.scheme_id)
        if scheme is not None:  # tolerate a scheme later removed from the catalog
            out.append(SavedSchemeOut(id=r.id, scheme=to_summary(scheme), created_at=r.created_at))
    return SavedSchemeListResponse(saved_schemes=out, count=len(out))


@router.post("/saved-schemes", response_model=SavedSchemeOut, status_code=201, responses={**_401, 404: {"model": ErrorResponse}})
def save_scheme(payload: SaveSchemeRequest, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scheme = db.get(Scheme, payload.scheme_id)
    if scheme is None or not scheme.is_active:
        raise AppError("SCHEME_NOT_FOUND", f"No scheme with id '{payload.scheme_id}'.", 404)
    existing = db.scalar(select(SavedScheme).where(SavedScheme.user_id == user.id, SavedScheme.scheme_id == scheme.id))
    if existing is None:
        existing = SavedScheme(user_id=user.id, scheme_id=scheme.id)
        db.add(existing)
        db.commit()
        db.refresh(existing)
    return SavedSchemeOut(id=existing.id, scheme=to_summary(scheme), created_at=existing.created_at)


@router.delete("/saved-schemes/{scheme_id}", status_code=204, responses=_401)
def unsave_scheme(scheme_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.scalar(select(SavedScheme).where(SavedScheme.user_id == user.id, SavedScheme.scheme_id == scheme_id))
    if row is not None:
        db.delete(row)
        db.commit()
    return None


@router.get("/saved-recommendations", response_model=SavedRecommendationListResponse, responses=_401)
def list_saved_recommendations(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(SavedRecommendation).where(SavedRecommendation.user_id == user.id).order_by(SavedRecommendation.created_at.desc())).all()
    out = [SavedRecommendationOut(id=r.id, request_id=r.request_id, request=r.request_payload, response=r.response_payload, created_at=r.created_at) for r in rows]
    return SavedRecommendationListResponse(saved_recommendations=out, count=len(out))


@router.post("/saved-recommendations", response_model=SavedRecommendationOut, status_code=201, responses=_401)
def save_recommendation(payload: SavedRecommendationCreate, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = SavedRecommendation(
        user_id=user.id, request_id=payload.response.request_id,
        request_payload=payload.request.model_dump(mode="json", by_alias=True),
        response_payload=payload.response.model_dump(mode="json", by_alias=True),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return SavedRecommendationOut(id=row.id, request_id=row.request_id, request=payload.request, response=payload.response, created_at=row.created_at)


@router.delete("/saved-recommendations/{saved_id}", status_code=204, responses=_401)
def unsave_recommendation(saved_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    row = db.scalar(select(SavedRecommendation).where(SavedRecommendation.id == saved_id, SavedRecommendation.user_id == user.id))
    if row is not None:
        db.delete(row)
        db.commit()
    return None
