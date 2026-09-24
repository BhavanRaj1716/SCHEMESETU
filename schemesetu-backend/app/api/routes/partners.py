from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.errors import AppError
from app.db.database import get_db
from app.schemas.common import ErrorResponse
from app.schemas.partner import PartnerListResponse, PartnerOut
from app.ingestion.nsfdc.verified_partners import NATIONAL_PARTNER_COUNT_NOTE
from app.services.partner_service import PartnerService, to_partner_out

router = APIRouter(prefix="/api/partners", tags=["Partners"])


@router.get("", response_model=PartnerListResponse, summary="Search authorised channel partners")
def list_partners(
    scheme: str | None = Query(None, description="Scheme id, e.g. term-loan"),
    state: str | None = None,
    district: str | None = None,
    type: str | None = Query(None, description="SCA, CA, PSB, RRB, NBFC-MFI, ..."),
    latitude: float | None = Query(None, ge=-90, le=90),
    longitude: float | None = Query(None, ge=-180, le=180),
    radius: float | None = Query(None, gt=0, le=2000, description="Kilometres; requires latitude and longitude"),
    db: Session = Depends(get_db),
):
    if radius is not None and (latitude is None or longitude is None):
        raise AppError("INVALID_REQUEST", "radius requires both latitude and longitude", 422)
    partners = PartnerService(db).search(scheme, state, district, type, latitude, longitude, radius)
    notices = [NATIONAL_PARTNER_COUNT_NOTE]
    if any(p.data_status.value == "DEMO" for p in partners):
        notices.append("Some records are DEMO data for demonstration only and are not real channel partners.")
    return PartnerListResponse(partners=partners, count=len(partners), notice=" ".join(notices))


@router.get("/{partner_id}", response_model=PartnerOut, responses={404: {"model": ErrorResponse}}, summary="Partner detail")
def get_partner(partner_id: str, db: Session = Depends(get_db)):
    p = PartnerService(db).get(partner_id)
    if p is None:
        raise AppError("PARTNER_NOT_FOUND", f"No partner with id '{partner_id}'.", 404)
    return to_partner_out(p)
