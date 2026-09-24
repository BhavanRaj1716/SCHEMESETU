from enum import Enum

from pydantic import Field

from app.schemas.common import CamelModel


class MoratoriumTreatment(str, Enum):
    NEEDS_VERIFICATION = "needs_verification"  # default: official source does not specify -> moratorium ignored + flagged
    INTEREST_ONLY = "interest_only"            # pay interest during moratorium, amortise principal afterwards
    CAPITALIZE = "capitalize"                  # interest accrues and is added to principal
    NONE = "none"                              # no interest accrues during moratorium


class EmiRequest(CamelModel):
    principal: float = Field(gt=0, le=1e10)
    annual_interest_rate: float = Field(ge=0, le=100)
    tenure_months: int = Field(ge=1, le=600)
    moratorium_months: int = Field(default=0, ge=0, le=120)
    moratorium_interest_treatment: MoratoriumTreatment = MoratoriumTreatment.NEEDS_VERIFICATION


class EmiAssumptions(CamelModel):
    interest_rate: float
    tenure_months: int
    frequency: str = "monthly"
    moratorium_months: int
    moratorium_interest_treatment: MoratoriumTreatment


class EmiResponse(CamelModel):
    emi: float
    total_interest: float
    total_repayment: float
    assumptions: EmiAssumptions
    notes: list[str]
