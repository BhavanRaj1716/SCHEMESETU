from math import asin, cos, radians, sin, sqrt

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.models import ChannelPartner
from app.schemas.partner import PartnerOut, PartnerSource


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    dlat, dlon = radians(lat2 - lat1), radians(lon2 - lon1)
    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    return 6371.0088 * 2 * asin(sqrt(a))


def to_partner_out(p: ChannelPartner, distance_km: float | None = None) -> PartnerOut:
    return PartnerOut(
        id=p.id, name=p.name, type=p.type, state=p.state, district=p.district, address=p.address,
        latitude=p.latitude, longitude=p.longitude, supported_schemes=p.supported_schemes or [],
        official_source=PartnerSource(url=p.official_source, document=p.source_document, last_verified=p.last_verified_at, data_status=p.data_status),
        data_status=p.data_status,
        distance_km=round(distance_km, 2) if distance_km is not None else None,
    )


class PartnerService:
    def __init__(self, db: Session):
        self.db = db

    def get(self, partner_id: str) -> ChannelPartner | None:
        return self.db.get(ChannelPartner, partner_id)

    def search(self, scheme=None, state=None, district=None, type_=None, latitude=None, longitude=None, radius=None) -> list[PartnerOut]:
        q = select(ChannelPartner)
        if state:
            q = q.where(func.lower(ChannelPartner.state) == state.strip().lower())
        if district:
            q = q.where(func.lower(ChannelPartner.district) == district.strip().lower())
        if type_:
            q = q.where(func.lower(ChannelPartner.type) == type_.strip().lower())
        rows = self.db.scalars(q.order_by(ChannelPartner.name)).all()
        if scheme:
            rows = [p for p in rows if scheme in (p.supported_schemes or [])]
        results: list[tuple[ChannelPartner, float | None]] = []
        for p in rows:
            dist = None
            if latitude is not None and longitude is not None and p.latitude is not None and p.longitude is not None:
                dist = haversine_km(latitude, longitude, p.latitude, p.longitude)
            if radius is not None and (dist is None or dist > radius):
                continue
            results.append((p, dist))
        if latitude is not None and longitude is not None:
            results.sort(key=lambda t: (t[1] is None, t[1] or 0))
        return [to_partner_out(p, d) for p, d in results]
