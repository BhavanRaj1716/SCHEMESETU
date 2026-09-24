from datetime import date, datetime
from enum import Enum

from pydantic import Field, model_validator

from app.schemas.common import CamelModel, DataStatus
from app.schemas.scheme import SchemeSummary


class RecommendRequest(CamelModel):
    purpose: str = Field(min_length=3, max_length=1000, description="Free-text requirement (English/Tamil/Hindi)")
    project_cost: float | None = Field(default=None, gt=0, le=1e10)
    loan_required: float | None = Field(default=None, gt=0, le=1e10)
    annual_income: float | None = Field(default=None, ge=0, le=1e11, description="Annual FAMILY income in INR")
    state: str | None = Field(default=None, max_length=64)
    district: str | None = Field(default=None, max_length=64)
    age: int | None = Field(default=None, ge=0, le=120)
    beneficiary_category: str | None = Field(default=None, max_length=64, description='e.g. "SC"')
    education_level: str | None = Field(default=None, max_length=64)

    @model_validator(mode="after")
    def _loan_not_above_cost(self):
        if self.loan_required is not None and self.project_cost is not None and self.loan_required > self.project_cost:
            raise ValueError("loanRequired cannot exceed projectCost")
        return self


class CheckStatus(str, Enum):
    MATCHED = "matched"
    NOT_MATCHED = "not_matched"
    NEEDS_VERIFICATION = "needs_verification"


class EligibilityCheck(CamelModel):
    criterion: str
    status: CheckStatus
    explanation: str
    source_url: str | None = None
    effective_from: date | None = None
    last_verified: date | None = None


class EligibilityOutcome(str, Enum):
    # NOT an approval prediction: it only says whether any stated input contradicts a published criterion.
    NO_MISMATCH_FOUND = "NO_MISMATCH_FOUND"
    MISMATCH_FOUND = "MISMATCH_FOUND"


class EligibilityCounts(CamelModel):
    matched: int
    not_matched: int
    needs_verification: int


class RelevanceFactor(CamelModel):
    factor: str
    matched: bool
    detail: str


class FinancialFit(CamelModel):
    coverage_percentage: float | None = None
    project_cost: float | None = None
    max_loan_by_coverage: float | None = None
    loan_required: float | None = None
    within_coverage: bool | None = None
    within_scheme_loan_limit: bool | None = None


class RecommendedScheme(CamelModel):
    scheme: SchemeSummary
    relevance_reason: str
    relevance_factors: list[RelevanceFactor]
    semantic_similarity: float = Field(description="Raw cosine similarity of text embeddings. NOT an eligibility measure; do not show as a percentage.")
    eligibility_checks: list[EligibilityCheck]
    eligibility_outcome: EligibilityOutcome
    eligibility_counts: EligibilityCounts
    financial_fit: FinancialFit
    requires_verification: bool
    official_application_url: str


class RetrievalInfo(CamelModel):
    normalized_query: str
    detected_language: str
    embedding_provider: str
    embedding_model: str
    candidates_considered: int
    min_similarity: float


class RecommendResponse(CamelModel):
    request_id: str
    data_status: DataStatus | None = None
    schemes: list[RecommendedScheme]
    retrieval: RetrievalInfo
    official_application_url: str
    disclaimer: str
    generated_at: datetime
