from pydantic.alias_generators import to_camel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.models import Scheme
from app.schemas.common import UNAVAILABLE_MESSAGE, OfficialSource
from app.schemas.scheme import (
    EligibilityRuleOut, FinancialDetails, InterestRateOption, SchemeDetail, SchemeSummary, SourceVersionOut,
)
from app.services.source_verification import unavailable_fields


def _f(v):
    return float(v) if v is not None else None


def financial_details(s: Scheme) -> FinancialDetails:
    return FinancialDetails(
        min_project_cost=_f(s.min_project_cost), max_project_cost=_f(s.max_project_cost),
        min_loan_amount=_f(s.min_loan_amount), max_loan_amount=_f(s.max_loan_amount),
        coverage_percentage=_f(s.coverage_percentage), interest_rate=_f(s.interest_rate),
        interest_rate_text=s.interest_rate_text,
        interest_rate_options=[InterestRateOption(**o) for o in s.interest_rate_options] if s.interest_rate_options else None,
        repayment_period=s.repayment_period, max_repayment_months=s.max_repayment_months,
        moratorium=s.moratorium, moratorium_months=s.moratorium_months,
    )


def official_source(s: Scheme) -> OfficialSource:
    return OfficialSource(
        organization=s.source_organization, url=s.source_url, document=s.source_document,
        last_verified=s.last_verified_at, data_updated=s.data_updated_at, data_status=s.data_status,
    )


def to_summary(s: Scheme) -> SchemeSummary:
    return SchemeSummary(
        id=s.id, scheme_code=s.scheme_code, name=s.name, purpose=s.purpose, category=s.category,
        beneficiary_category=s.beneficiary_category, financial_details=financial_details(s),
        official_source=official_source(s),
        official_application_url=s.official_application_url or get_settings().pm_suraj_url,
        data_status=s.data_status,
    )


def to_detail(s: Scheme) -> SchemeDetail:
    missing = unavailable_fields(s)
    base = to_summary(s).model_dump()
    return SchemeDetail(
        **base,
        description=s.description, state_scope=s.state_scope, district_scope=s.district_scope,
        eligibility_summary=s.eligibility_summary, required_documents=s.required_documents,
        application_process=s.application_process, applicable_activities=s.applicable_activities,
        eligibility_rules=[
            EligibilityRuleOut(
                criterion=r.criterion, field=r.field, operator=r.operator, value=r.value, unit=r.unit,
                description=r.description, amended_from_time_to_time=r.amended_from_time_to_time,
                source_url=r.source_url, source_document=r.source_document, effective_from=r.effective_from,
                effective_to=r.effective_to, last_verified=r.last_verified_at, data_status=r.data_status,
            )
            for r in s.rules
        ],
        source_history=[
            SourceVersionOut(field_name=v.field_name, old_value=v.old_value, new_value=v.new_value, source_url=v.source_url,
                             verified_at=v.verified_at, effective_from=v.effective_from, effective_to=v.effective_to)
            for v in s.versions
        ],
        unavailable_fields=[to_camel(f) for f in missing],  # API field names are camelCase
        unavailable_message=UNAVAILABLE_MESSAGE if missing else None,
    )


def list_schemes(db: Session, category=None, purpose=None, state=None, beneficiary_category=None) -> list[Scheme]:
    rows = db.scalars(select(Scheme).where(Scheme.is_active.is_(True)).order_by(Scheme.name)).all()
    out = []
    for s in rows:
        if category and (s.category or "").lower() != category.lower():
            continue
        if purpose:
            hay = " ".join([s.name or "", s.purpose or "", s.description or "", " ".join(s.applicable_activities or [])]).lower()
            if purpose.lower() not in hay:
                continue
        if state and (s.state_scope or "ALL_INDIA") not in ("ALL_INDIA", "ALL") and s.state_scope.lower() != state.lower():
            continue
        if beneficiary_category and beneficiary_category.upper() not in [b.upper() for b in (s.beneficiary_category or [])]:
            continue
        out.append(s)
    return out
