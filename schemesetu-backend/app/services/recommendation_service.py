"""Recommendation pipeline:

validated request -> normalise -> embed -> vector search -> eligibility rules -> verified scheme data -> response

Semantic relevance and eligibility are kept separate: no combined score exists anywhere.
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.config import Settings, get_settings
from app.db.models import Scheme
from app.schemas.common import DataStatus
from app.schemas.recommend import (
    CheckStatus, EligibilityCounts, EligibilityOutcome, FinancialFit, RecommendedScheme, RecommendRequest,
    RecommendResponse, RelevanceFactor, RetrievalInfo,
)
from app.services.calculator_service import coverage_amount
from app.services.eligibility_engine import Applicant, EligibilityEngine, intent_label
from app.services.embedding_service import EmbeddingService, get_embedding_service
from app.services.scheme_service import to_summary
from app.services.semantic_search import Candidate, SemanticSearch
from app.services.source_verification import aggregate_status
from app.utils.text import detect_intents, detect_language, format_inr, normalize_category, normalize_text

DISCLAIMER = (
    "Information only. SchemeSetu does not approve loans or predict approval. Final eligibility is decided by the "
    "authorised channelizing agency / NSFDC. Apply through the official PM-SURAJ portal."
)


def _cost_in_range(s: Scheme, cost: float | None) -> bool:
    """min_project_cost is an EXCLUSIVE lower bound (NSFDC: Term Loan is for units costing 'more than' ₹1.40 lakh)."""
    if cost is None:
        return True
    if s.min_project_cost is not None and cost <= float(s.min_project_cost):
        return False
    return s.max_project_cost is None or cost <= float(s.max_project_cost)


class RecommendationService:
    def __init__(self, db: Session, embedder: EmbeddingService | None = None, settings: Settings | None = None):
        self.db = db
        self.embedder = embedder or get_embedding_service()
        self.settings = settings or get_settings()
        self.engine = EligibilityEngine()

    def recommend(self, req: RecommendRequest) -> RecommendResponse:
        normalized = normalize_text(req.purpose)
        applicant = Applicant(
            purpose_intents=detect_intents(normalized), project_cost=req.project_cost, loan_required=req.loan_required,
            annual_income=req.annual_income, state=req.state, district=req.district, age=req.age,
            beneficiary_category=req.beneficiary_category, education_level=req.education_level,
        )
        query_vec = self.embedder.embed_one(normalized)
        candidates = SemanticSearch(self.db).search(query_vec, self.settings.semantic_top_k, self.settings.semantic_min_similarity)

        results = [self._build(c, applicant, req) for c in candidates]
        # Order: schemes with no contradicted criterion first, then by semantic relevance. No blended score.
        results.sort(key=lambda r: (r.eligibility_outcome == EligibilityOutcome.MISMATCH_FOUND, -r.semantic_similarity))

        return RecommendResponse(
            request_id=str(uuid.uuid4()),
            data_status=aggregate_status([r.scheme.data_status.value for r in results]),
            schemes=results,
            retrieval=RetrievalInfo(
                normalized_query=normalized, detected_language=detect_language(req.purpose),
                embedding_provider=self.embedder.provider, embedding_model=self.embedder.model_name,
                candidates_considered=len(candidates), min_similarity=self.settings.semantic_min_similarity,
            ),
            official_application_url=self.settings.pm_suraj_url,
            disclaimer=DISCLAIMER,
            generated_at=datetime.now(timezone.utc),
        )

    # ------------------------------------------------------------------
    def _build(self, cand: Candidate, a: Applicant, req: RecommendRequest) -> RecommendedScheme:
        s = cand.scheme
        checks = self.engine.evaluate(s.rules, a)
        counts = EligibilityCounts(
            matched=sum(c.status == CheckStatus.MATCHED for c in checks),
            not_matched=sum(c.status == CheckStatus.NOT_MATCHED for c in checks),
            needs_verification=sum(c.status == CheckStatus.NEEDS_VERIFICATION for c in checks),
        )
        outcome = EligibilityOutcome.MISMATCH_FOUND if counts.not_matched else EligibilityOutcome.NO_MISMATCH_FOUND
        factors = self._relevance_factors(s, cand.similarity, a, req)
        return RecommendedScheme(
            scheme=to_summary(s),
            relevance_reason=self._reason(s, factors),
            relevance_factors=factors,
            semantic_similarity=round(cand.similarity, 4),
            eligibility_checks=checks,
            eligibility_outcome=outcome,
            eligibility_counts=counts,
            financial_fit=self._financial_fit(s, req),
            requires_verification=True,  # eligibility is always confirmed by the authorised agency
            official_application_url=s.official_application_url or self.settings.pm_suraj_url,
        )

    def _financial_fit(self, s: Scheme, req: RecommendRequest) -> FinancialFit:
        pct = float(s.coverage_percentage) if s.coverage_percentage is not None else None
        max_by_cov = coverage_amount(req.project_cost, pct) if (pct is not None and req.project_cost) else None
        within_cov = (req.loan_required <= max_by_cov) if (max_by_cov is not None and req.loan_required is not None) else None
        within_limit = (req.loan_required <= float(s.max_loan_amount)) if (s.max_loan_amount is not None and req.loan_required is not None) else None
        return FinancialFit(
            coverage_percentage=pct, project_cost=req.project_cost, max_loan_by_coverage=max_by_cov,
            loan_required=req.loan_required, within_coverage=within_cov, within_scheme_loan_limit=within_limit,
        )

    def _relevance_factors(self, s: Scheme, sim: float, a: Applicant, req: RecommendRequest) -> list[RelevanceFactor]:
        f = [RelevanceFactor(factor="Semantic similarity", matched=True, detail="The requirement text is semantically close to the scheme's documented purpose and activities.")]
        if s.category and s.category in a.purpose_intents:
            f.append(RelevanceFactor(factor="Purpose match", matched=True, detail=f"The stated requirement concerns {intent_label(s.category)}, which is this scheme's documented focus."))
        elif a.purpose_intents and s.category:
            f.append(RelevanceFactor(factor="Purpose match", matched=False, detail=f"The stated requirement appears to concern {', '.join(sorted(intent_label(i) for i in a.purpose_intents))}; this scheme's focus is {intent_label(s.category)}."))

        if req.project_cost is not None or req.loan_required is not None:
            hi = float(s.max_project_cost) if s.max_project_cost is not None else None
            cost_ok = _cost_in_range(s, req.project_cost)
            loan_ok = req.loan_required is None or s.max_loan_amount is None or req.loan_required <= float(s.max_loan_amount)
            ok = bool(cost_ok and loan_ok)
            rng = f"project cost up to {format_inr(hi)}" if hi else "the documented range"
            f.append(RelevanceFactor(factor="Financial range match", matched=ok, detail=f"The requested amounts {'fall within' if ok else 'fall outside'} the scheme's documented financial range ({rng})."))

        cat = normalize_category(a.beneficiary_category)
        if cat and s.beneficiary_category:
            ok = cat in [b.upper() for b in s.beneficiary_category]
            f.append(RelevanceFactor(factor="Beneficiary category match", matched=ok, detail=f"The scheme is for {', '.join(s.beneficiary_category)} beneficiaries; provided category is {cat}."))
        if req.state:
            f.append(RelevanceFactor(factor="State applicability", matched=(s.state_scope or "ALL_INDIA") in ("ALL_INDIA", "ALL") or s.state_scope.lower() == req.state.lower(),
                                     detail="No state restriction is stated for this scheme; availability depends on the channelizing agency in your state." if (s.state_scope or "ALL_INDIA") in ("ALL_INDIA", "ALL") else f"Scheme scope: {s.state_scope}."))
        return f

    def _reason(self, s: Scheme, factors: list[RelevanceFactor]) -> str:
        hits = [f.factor.lower() for f in factors if f.matched]
        misses = [f.factor.lower() for f in factors if not f.matched]
        text = f"Retrieved because the stated requirement is semantically related to {s.name}'s documented purpose"
        extra = [h for h in hits if h != "semantic similarity"]
        if extra:
            text += f", and there is a {', '.join(extra[:-1]) + (' and ' if len(extra) > 1 else '') + extra[-1]}"
        text += "."
        if misses:
            text += f" Not matched: {', '.join(misses)} (see eligibility checks)."
        return text
