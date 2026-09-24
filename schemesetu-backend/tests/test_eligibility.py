from datetime import date

from app.db.models import EligibilityRule, Scheme
from app.schemas.recommend import CheckStatus
from app.services.eligibility_engine import Applicant, EligibilityEngine

M, N, V = CheckStatus.MATCHED, CheckStatus.NOT_MATCHED, CheckStatus.NEEDS_VERIFICATION
engine = EligibilityEngine()


def rule(field, op, value, criterion=None, unit=None, **kw):
    return EligibilityRule(criterion=criterion or field, field=field, operator=op, value=value, unit=unit, description="", data_status="VERIFIED", **kw)


def status(checks, criterion):
    return next(c.status for c in checks if c.criterion == criterion)


def term_loan_rules(db):
    return db.get(Scheme, "term-loan").rules


# --- income --------------------------------------------------------------
def test_income_below_threshold(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(annual_income=250000)), "Annual family income") == M


def test_income_at_threshold_matches(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(annual_income=500000)), "Annual family income") == M


def test_income_above_threshold(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(annual_income=500001)), "Annual family income") == N


def test_missing_income_needs_verification(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant()), "Annual family income") == V


# --- category ------------------------------------------------------------
def test_category_sc_matches_including_aliases(db):
    for v in ("SC", "sc", "Scheduled Caste"):
        assert status(engine.evaluate(term_loan_rules(db), Applicant(beneficiary_category=v)), "Beneficiary category") == M


def test_wrong_category(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(beneficiary_category="General")), "Beneficiary category") == N


def test_missing_category_needs_verification(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant()), "Beneficiary category") == V


def test_caste_status_always_needs_agency_verification(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(beneficiary_category="SC"))
    assert status(checks, "Scheduled Caste status verification") == V


# --- loan amount / project cost ----------------------------------------------
def test_loan_within_range(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(loan_required=250000, project_cost=300000))
    assert status(checks, "Loan amount") == M and status(checks, "Project cost") == M
    assert status(checks, "Loan up to 90% of project cost") == M


def test_loan_outside_range(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(loan_required=5000000, project_cost=6000000))
    assert status(checks, "Loan amount") == N and status(checks, "Project cost") == N


def test_term_loan_lower_bound_is_exclusive(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(loan_required=125000, project_cost=140000))
    assert status(checks, "Loan amount") == N and status(checks, "Project cost") == N


def test_loan_above_90_percent_of_cost(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(loan_required=280000, project_cost=300000))
    assert status(checks, "Loan up to 90% of project cost") == N


def test_ninety_percent_explanation_shows_computed_arithmetic(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant(loan_required=250000, project_cost=300000))
    text = next(c.explanation for c in checks if c.criterion == "Loan up to 90% of project cost")
    assert "₹2,70,000" in text and "₹2,50,000" in text


def test_missing_amounts_need_verification(db):
    checks = engine.evaluate(term_loan_rules(db), Applicant())
    assert status(checks, "Loan amount") == V and status(checks, "Project cost") == V


# --- state / district / age / purpose (custom + seeded rules) ---------------------
def test_state_specific_rule_wrong_missing_and_right():
    r = [rule("state", "in", ["Kerala"], "State applicability")]
    assert status(engine.evaluate(r, Applicant(state="Tamil Nadu")), "State applicability") == N
    assert status(engine.evaluate(r, Applicant(state="kerala")), "State applicability") == M
    assert status(engine.evaluate(r, Applicant()), "State applicability") == V


def test_all_india_scheme_matches_any_state(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(state="Tamil Nadu")), "State applicability") == M


def test_age_rule_between():
    r = [rule("age", "between", {"min": 18, "max": 55}, "Age", unit="years")]
    assert status(engine.evaluate(r, Applicant(age=25)), "Age") == M
    assert status(engine.evaluate(r, Applicant(age=17)), "Age") == N
    assert status(engine.evaluate(r, Applicant()), "Age") == V


def test_purpose_mismatch_and_unknown(db):
    assert status(engine.evaluate(term_loan_rules(db), Applicant(purpose_intents={"education"})), "Purpose of financing") == N
    assert status(engine.evaluate(term_loan_rules(db), Applicant(purpose_intents={"income_generating"})), "Purpose of financing") == M
    assert status(engine.evaluate(term_loan_rules(db), Applicant()), "Purpose of financing") == V


def test_education_level_rule(db):
    rules = db.get(Scheme, "educational-loan-scheme").rules
    assert status(engine.evaluate(rules, Applicant(education_level="Undergraduate")), "Education level") == M
    assert status(engine.evaluate(rules, Applicant(education_level="school")), "Education level") == N
    assert status(engine.evaluate(rules, Applicant()), "Education level") == V


# --- versioned rules -----------------------------------------------------------
def test_rules_outside_effective_window_are_ignored():
    rules = [
        rule("annual_family_income", "<=", 300000, "Income", effective_from=date(2020, 1, 1), effective_to=date(2025, 12, 31)),
        rule("annual_family_income", "<=", 500000, "Income", effective_from=date(2026, 1, 7)),
    ]
    checks = engine.evaluate(rules, Applicant(annual_income=400000), on=date(2026, 9, 22))
    assert len(checks) == 1 and checks[0].status == M
    old = engine.evaluate(rules, Applicant(annual_income=400000), on=date(2025, 6, 1))
    assert len(old) == 1 and old[0].status == N


def test_amended_from_time_to_time_is_represented():
    r = [rule("annual_family_income", "<=", 500000, "Income", unit="INR/year", amended_from_time_to_time=True)]
    assert "amended from time to time" in engine.evaluate(r, Applicant(annual_income=1))[0].explanation
