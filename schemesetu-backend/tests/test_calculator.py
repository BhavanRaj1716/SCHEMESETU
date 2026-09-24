import math

import pytest

from app.schemas.calculator import EmiRequest, MoratoriumTreatment
from app.services.calculator_service import compute_emi, coverage_amount


def reference_emi(p, annual, n):
    r = annual / 12 / 100
    return p * r * (1 + r) ** n / ((1 + r) ** n - 1)


def test_known_arithmetic_100k_12pct_12m():
    res = compute_emi(EmiRequest(principal=100000, annual_interest_rate=12, tenure_months=12))
    assert res.emi == 8884.88  # standard textbook value
    assert res.total_repayment == pytest.approx(8884.8788 * 12, abs=0.05)
    assert res.total_interest == pytest.approx(res.total_repayment - 100000, abs=0.01)


def test_spec_example_term_loan_250k_8pct_84m():
    res = compute_emi(EmiRequest(principal=250000, annual_interest_rate=8, tenure_months=84))
    assert res.emi == pytest.approx(reference_emi(250000, 8, 84), abs=0.005)
    assert 3800 < res.emi < 4000
    assert res.assumptions.frequency == "monthly"
    assert res.assumptions.interest_rate == 8


def test_zero_interest():
    res = compute_emi(EmiRequest(principal=120000, annual_interest_rate=0, tenure_months=12))
    assert res.emi == 10000 and res.total_interest == 0


def test_moratorium_default_is_flagged_not_invented():
    res = compute_emi(EmiRequest(principal=100000, annual_interest_rate=12, tenure_months=36, moratorium_months=3))
    assert res.assumptions.moratorium_interest_treatment == MoratoriumTreatment.NEEDS_VERIFICATION
    assert res.emi == pytest.approx(reference_emi(100000, 12, 36), abs=0.005)  # moratorium ignored
    assert any("needs_verification" in n for n in res.notes)


def test_moratorium_interest_only_and_capitalize_are_configurable():
    base = dict(principal=100000, annual_interest_rate=12, tenure_months=36, moratorium_months=3)
    io = compute_emi(EmiRequest(**base, moratorium_interest_treatment="interest_only"))
    assert io.emi == pytest.approx(reference_emi(100000, 12, 33), abs=0.005)
    assert io.total_repayment == pytest.approx(100000 * 0.01 * 3 + reference_emi(100000, 12, 33) * 33, abs=0.05)
    cap = compute_emi(EmiRequest(**base, moratorium_interest_treatment="capitalize"))
    assert cap.emi == pytest.approx(reference_emi(100000 * 1.01**3, 12, 33), abs=0.01)
    assert cap.emi > io.emi


def test_moratorium_not_shorter_than_tenure_rejected():
    with pytest.raises(ValueError):
        compute_emi(EmiRequest(principal=1000, annual_interest_rate=5, tenure_months=6, moratorium_months=6))


def test_coverage_arithmetic_is_computed_not_hardcoded():
    assert coverage_amount(300000, 90) == 270000
    assert coverage_amount(250000, 90) == 225000
    assert not math.isnan(coverage_amount(1, 90))
