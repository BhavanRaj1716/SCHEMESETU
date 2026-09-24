from datetime import date

from app.schemas.common import CamelModel, DataStatus


class PartnerSource(CamelModel):
    url: str | None = None
    document: str | None = None
    last_verified: date | None = None
    data_status: DataStatus


class FundHealth(CamelModel):
    available: bool = False
    message: str = "Partner-level fund-health information is not available in the current verified dataset."


class PartnerOut(CamelModel):
    id: str
    name: str
    type: str
    state: str | None = None
    district: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    supported_schemes: list[str] = []
    official_source: PartnerSource
    data_status: DataStatus
    distance_km: float | None = None
    fund_health: FundHealth = FundHealth()


class PartnerListResponse(CamelModel):
    partners: list[PartnerOut]
    count: int
    notice: str | None = None
