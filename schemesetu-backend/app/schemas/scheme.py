from datetime import date

from app.schemas.common import CamelModel, DataStatus, OfficialSource


class InterestRateOption(CamelModel):
    label: str
    rate: float


class FinancialDetails(CamelModel):
    min_project_cost: float | None = None
    max_project_cost: float | None = None
    min_loan_amount: float | None = None
    max_loan_amount: float | None = None
    coverage_percentage: float | None = None
    interest_rate: float | None = None  # rate the beneficiary pays, % p.a.; null when it depends on the channel partner type
    interest_rate_text: str | None = None
    interest_rate_options: list[InterestRateOption] | None = None
    repayment_period: str | None = None
    max_repayment_months: int | None = None
    moratorium: str | None = None
    moratorium_months: int | None = None


class SchemeSummary(CamelModel):
    id: str
    scheme_code: str
    name: str
    purpose: str | None = None
    category: str | None = None
    beneficiary_category: list[str] | None = None
    financial_details: FinancialDetails
    official_source: OfficialSource
    official_application_url: str | None = None
    data_status: DataStatus


class EligibilityRuleOut(CamelModel):
    criterion: str
    field: str
    operator: str
    value: object | None = None
    unit: str | None = None
    description: str | None = None
    amended_from_time_to_time: bool = False
    source_url: str | None = None
    source_document: str | None = None
    effective_from: date | None = None
    effective_to: date | None = None
    last_verified: date | None = None
    data_status: DataStatus


class SourceVersionOut(CamelModel):
    field_name: str
    old_value: object | None = None
    new_value: object | None = None
    source_url: str | None = None
    verified_at: date | None = None
    effective_from: date | None = None
    effective_to: date | None = None


class SchemeDetail(SchemeSummary):
    description: str | None = None
    state_scope: str | None = None
    district_scope: str | None = None
    eligibility_summary: str | None = None
    required_documents: list[str] | None = None
    application_process: str | None = None
    applicable_activities: list[str] | None = None
    eligibility_rules: list[EligibilityRuleOut] = []
    source_history: list[SourceVersionOut] = []
    unavailable_fields: list[str] = []
    unavailable_message: str | None = None


class SchemeListResponse(CamelModel):
    schemes: list[SchemeSummary]
    count: int
