"""Financial calculator. EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annual/12/100."""
from app.schemas.calculator import EmiAssumptions, EmiRequest, EmiResponse, MoratoriumTreatment


def coverage_amount(project_cost: float, coverage_percentage: float) -> float:
    """Maximum loan implied by a coverage percentage, e.g. 90% of ₹3,00,000 = ₹2,70,000."""
    return round(project_cost * coverage_percentage / 100.0, 2)


def _emi(principal: float, monthly_rate: float, n: int) -> float:
    if n <= 0:
        raise ValueError("number of installments must be positive")
    if monthly_rate == 0:
        return principal / n
    f = (1 + monthly_rate) ** n
    return principal * monthly_rate * f / (f - 1)


def compute_emi(req: EmiRequest) -> EmiResponse:
    r = req.annual_interest_rate / 12 / 100
    m = req.moratorium_months
    n = req.tenure_months
    t = req.moratorium_interest_treatment
    notes = [
        "Illustrative monthly-instalment calculation. Actual NSFDC schemes may use quarterly instalments; confirm the schedule with the channelizing agency.",
        "This is an arithmetic estimate, not a loan offer or approval.",
    ]
    if m >= n:
        raise ValueError("moratoriumMonths must be less than tenureMonths")

    if m == 0 or t == MoratoriumTreatment.NEEDS_VERIFICATION:
        emi = _emi(req.principal, r, n)
        total_repayment = emi * n
        if m > 0:
            notes.append("How interest behaves during the moratorium is not specified by the official source (needs_verification); this estimate ignores the moratorium.")
    elif t == MoratoriumTreatment.INTEREST_ONLY:
        emi = _emi(req.principal, r, n - m)
        total_repayment = req.principal * r * m + emi * (n - m)
        notes.append(f"Assumes interest-only payments during the {m}-month moratorium (configurable assumption, not an official scheme rule).")
    elif t == MoratoriumTreatment.CAPITALIZE:
        grown = req.principal * (1 + r) ** m
        emi = _emi(grown, r, n - m)
        total_repayment = emi * (n - m)
        notes.append(f"Assumes interest accrued during the {m}-month moratorium is added to the principal (configurable assumption).")
    else:  # NONE
        emi = _emi(req.principal, r, n - m)
        total_repayment = emi * (n - m)
        notes.append(f"Assumes no interest accrues during the {m}-month moratorium (configurable assumption).")

    return EmiResponse(
        emi=round(emi, 2),
        total_interest=round(total_repayment - req.principal, 2),
        total_repayment=round(total_repayment, 2),
        assumptions=EmiAssumptions(
            interest_rate=req.annual_interest_rate,
            tenure_months=n,
            frequency="monthly",
            moratorium_months=m,
            moratorium_interest_treatment=t,
        ),
        notes=notes,
    )
