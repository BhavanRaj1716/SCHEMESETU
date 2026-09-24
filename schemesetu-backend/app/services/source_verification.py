"""Provenance helpers: which values are unavailable, overall data status, staleness."""
from datetime import date

from app.schemas.common import DataStatus

CRITICAL_SCHEME_FIELDS = ("max_loan_amount", "interest_rate_text", "repayment_period", "moratorium", "required_documents")


def unavailable_fields(scheme) -> list[str]:
    return [f for f in CRITICAL_SCHEME_FIELDS if getattr(scheme, f) in (None, "", [])]


def aggregate_status(statuses: list[str]) -> DataStatus | None:
    """DEMO if any record is DEMO; LIVE only if all are LIVE; otherwise VERIFIED."""
    if not statuses:
        return None
    if "DEMO" in statuses:
        return DataStatus.DEMO
    if all(s == "LIVE" for s in statuses):
        return DataStatus.LIVE
    return DataStatus.VERIFIED


def days_since_verified(last_verified: date | None, today: date | None = None) -> int | None:
    if last_verified is None:
        return None
    return ((today or date.today()) - last_verified).days
