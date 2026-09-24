"""Deterministic eligibility rule engine.

Every check returns one of: matched | not_matched | needs_verification.
- Missing applicant data NEVER counts as a match or a failure -> needs_verification.
- No LLM, no scoring, no probabilities. The rules in the database are the only authority.
"""
from dataclasses import dataclass, field
from datetime import date

from app.db.models import EligibilityRule
from app.schemas.recommend import CheckStatus, EligibilityCheck
from app.utils.text import format_inr, normalize_category

MATCHED, NOT_MATCHED, NEEDS = CheckStatus.MATCHED, CheckStatus.NOT_MATCHED, CheckStatus.NEEDS_VERIFICATION


@dataclass
class Applicant:
    purpose_intents: set[str] = field(default_factory=set)
    project_cost: float | None = None
    loan_required: float | None = None
    annual_income: float | None = None
    state: str | None = None
    district: str | None = None
    age: int | None = None
    beneficiary_category: str | None = None
    education_level: str | None = None

    def value_for(self, fld: str):
        if fld == "annual_family_income":
            return self.annual_income
        if fld == "beneficiary_category":
            return normalize_category(self.beneficiary_category)
        if fld == "loan_to_project_cost_ratio":
            if self.loan_required is not None and self.project_cost:
                return self.loan_required / self.project_cost
            return None
        if fld == "purpose_category":
            return self.purpose_intents or None
        if fld in ("state", "district"):
            v = getattr(self, fld)
            return v.strip().lower() if v else None
        if fld == "education_level":
            return self.education_level.strip().lower() if self.education_level else None
        return getattr(self, fld, None)


def _fmt(value, unit: str | None) -> str:
    if isinstance(value, (int, float)) and unit and unit.upper().startswith("INR"):
        return format_inr(value)
    return str(value)


def _cmp(op: str, actual, expected) -> bool:
    if op == "<=":
        return actual <= expected
    if op == "<":
        return actual < expected
    if op == ">=":
        return actual >= expected
    if op == ">":
        return actual > expected
    if op == "==":
        return actual == expected
    if op == "!=":
        return actual != expected
    raise ValueError(f"Unsupported operator {op!r}")


_LABELS = {"income_generating": "income-generating activities", "education": "education"}


def intent_label(intent: str) -> str:
    return _LABELS.get(intent, intent.replace("_", " "))


_OP_WORDS = {"<=": "at most", "<": "below", ">=": "at least", ">": "above", "==": "exactly", "!=": "other than"}


class EligibilityEngine:
    def active_rules(self, rules: list[EligibilityRule], on: date | None = None) -> list[EligibilityRule]:
        on = on or date.today()
        return [r for r in rules if (r.effective_from is None or r.effective_from <= on) and (r.effective_to is None or r.effective_to >= on)]

    def evaluate(self, rules: list[EligibilityRule], applicant: Applicant, on: date | None = None) -> list[EligibilityCheck]:
        return [self._check(r, applicant) for r in self.active_rules(rules, on)]

    # ------------------------------------------------------------------
    def _result(self, r: EligibilityRule, status: CheckStatus, explanation: str) -> EligibilityCheck:
        note = " NSFDC notes this criterion may be amended from time to time." if r.amended_from_time_to_time else ""
        return EligibilityCheck(
            criterion=r.criterion,
            status=status,
            explanation=explanation + note,
            source_url=r.source_url,
            effective_from=r.effective_from,
            last_verified=r.last_verified_at,
        )

    def _check(self, r: EligibilityRule, a: Applicant) -> EligibilityCheck:
        if r.operator == "manual":
            return self._result(r, NEEDS, r.description or "This criterion must be verified by the authorised agency.")

        actual = a.value_for(r.field)
        missing_msg = f"{r.criterion} was not provided, so it cannot be checked. {r.description or ''}".strip()
        if actual is None:
            return self._result(r, NEEDS, missing_msg)

        if r.field == "purpose_category":
            return self._purpose(r, actual)
        if r.field in ("state", "district"):
            return self._place(r, actual, a)
        if r.field == "loan_to_project_cost_ratio":
            return self._coverage(r, a)
        if r.operator == "between":
            return self._between(r, actual)
        if r.operator in ("in", "not_in"):
            return self._membership(r, actual)
        return self._simple(r, actual)

    # --- individual evaluators --------------------------------------
    def _simple(self, r, actual):
        expected = r.value
        if isinstance(actual, str) and isinstance(expected, str):
            actual_c, expected_c = actual.lower(), expected.lower()
        else:
            actual_c, expected_c = actual, expected
        ok = _cmp(r.operator, actual_c, expected_c)
        if r.operator in ("==", "!=") and isinstance(expected, str):
            verb = "matches" if ok else "does not match"
            return self._result(r, MATCHED if ok else NOT_MATCHED, f"Provided {r.criterion.lower()} ({actual}) {verb} the currently verified requirement ({'not ' if r.operator == '!=' else ''}{expected}).")
        word = _OP_WORDS.get(r.operator, r.operator)
        text = f"Provided {r.criterion.lower()} ({_fmt(actual, r.unit)}) is {'within' if ok else 'outside'} the currently verified requirement ({word} {_fmt(expected, r.unit)})."
        return self._result(r, MATCHED if ok else NOT_MATCHED, text)

    def _between(self, r, actual):
        lo, hi = r.value.get("min"), r.value.get("max")
        lo_ex, hi_ex = r.value.get("minExclusive", False), r.value.get("maxExclusive", False)
        ok = (lo is None or (actual > lo if lo_ex else actual >= lo)) and (hi is None or (actual < hi if hi_ex else actual <= hi))
        lo_txt = "" if lo is None else f"{'above' if lo_ex else 'from'} {_fmt(lo, r.unit)}"
        hi_txt = "" if hi is None else f"{'below' if hi_ex else 'up to'} {_fmt(hi, r.unit)}"
        rng = " and ".join(t for t in (lo_txt, hi_txt) if t)
        text = f"Provided {r.criterion.lower()} ({_fmt(actual, r.unit)}) is {'within' if ok else 'outside'} the scheme's documented range ({rng})."
        return self._result(r, MATCHED if ok else NOT_MATCHED, text)

    def _membership(self, r, actual):
        allowed = [str(v).lower() for v in r.value]
        inside = str(actual).lower() in allowed
        ok = inside if r.operator == "in" else not inside
        return self._result(
            r,
            MATCHED if ok else NOT_MATCHED,
            f"Provided {r.criterion.lower()} ({actual}) {'is' if ok else 'is not'} among the categories covered by the scheme ({', '.join(map(str, r.value))}).",
        )

    def _purpose(self, r, intents):
        wanted = r.value
        if wanted in intents:
            return self._result(r, MATCHED, f"The stated purpose appears to concern {intent_label(wanted)}, which this scheme covers.")
        return self._result(
            r,
            NOT_MATCHED,
            f"The stated purpose appears to concern {', '.join(sorted(intent_label(i) for i in intents))}, whereas this scheme covers {intent_label(wanted)}.",
        )

    def _place(self, r, actual, a):
        allowed = [str(v) for v in (r.value if isinstance(r.value, list) else [r.value])]
        if "ALL_INDIA" in allowed or "ALL" in allowed:
            return self._result(
                r,
                MATCHED,
                f"No state restriction is stated in the scheme's official description. Delivery is through channelizing agencies, so confirm an authorised partner is available in {getattr(a, r.field).strip()}.",
            )
        ok = actual in [v.lower() for v in allowed]
        return self._result(
            r,
            MATCHED if ok else NOT_MATCHED,
            f"Provided {r.field} ({getattr(a, r.field).strip()}) {'is' if ok else 'is not'} within the scheme's stated area ({', '.join(allowed)}).",
        )

    def _coverage(self, r, a):
        pct = float(r.value) * 100
        cap = a.project_cost * float(r.value)
        ok = a.loan_required <= cap + 1e-9
        return self._result(
            r,
            MATCHED if ok else NOT_MATCHED,
            f"The scheme finances up to {pct:g}% of project cost: {pct:g}% of {format_inr(a.project_cost)} is {format_inr(cap)}, so the requested loan of {format_inr(a.loan_required)} is {'within' if ok else 'above'} that limit.",
        )
