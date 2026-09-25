import json

from app.schemas.recommend import RecommendRequest
from app.services.embedding_service import get_embedding_service
from app.services.recommendation_service import RecommendationService
from app.services.semantic_search import SemanticSearch
from app.utils.text import normalize_text


def search(db, q, k=5, min_sim=0.05):
    emb = get_embedding_service()
    return SemanticSearch(db).search(emb.embed_one(normalize_text(q)), k, min_sim)


def test_semantic_search_dairy_query_retrieves_income_generating_schemes(db):
    ids = [c.scheme.id for c in search(db, "I need ₹3 lakh to start a dairy business")]
    assert {"term-loan", "udyam-nidhi-yojana"} <= set(ids)
    assert "educational-loan-scheme" not in ids


def test_semantic_search_education_query_ranks_els_first(db):
    hits = search(db, "college fees for engineering course")
    assert hits and hits[0].scheme.id == "educational-loan-scheme"


def test_semantic_search_unrelated_query_returns_nothing(db):
    assert search(db, "zzz qqq xxx", min_sim=0.2) == []


def test_recommendation_pipeline_demo_scenario(db):
    req = RecommendRequest(purpose="dairy business", project_cost=300000, loan_required=250000, annual_income=250000,
                           state="Tamil Nadu", district="Coimbatore", age=25, beneficiary_category="SC")
    res = RecommendationService(db).recommend(req)
    by_id = {r.scheme.id: r for r in res.schemes}
    assert res.data_status.value == "VERIFIED"
    for sid in ("term-loan", "udyam-nidhi-yojana"):
        assert by_id[sid].eligibility_outcome.value == "NO_MISMATCH_FOUND"
        assert by_id[sid].financial_fit.max_loan_by_coverage == 270000
        assert by_id[sid].financial_fit.within_coverage is True
    for sid in ("micro-finance-scheme", "aajeevika-micro-finance-yojana"):
        if sid in by_id:
            assert by_id[sid].eligibility_outcome.value == "MISMATCH_FOUND"
    outcomes = [r.eligibility_outcome.value for r in res.schemes]
    assert outcomes == sorted(outcomes, key=lambda o: o == "MISMATCH_FOUND")  # no-mismatch first
    assert all(r.requires_verification for r in res.schemes)
    assert res.official_application_url.startswith("https://pmsuraj.dosje.gov.in")


def test_recommendation_never_emits_scores_or_approval_claims(db):
    res = RecommendationService(db).recommend(RecommendRequest(purpose="dairy business", project_cost=300000, loan_required=250000))
    blob = json.dumps(res.model_dump(mode="json", by_alias=True)["schemes"]).lower()
    for banned in ("probab", "eligibilityscore", "approved", "guarantee", "% eligible", "you will receive"):
        assert banned not in blob


def test_minimal_request_yields_verification_not_failure(db):
    res = RecommendationService(db).recommend(RecommendRequest(purpose="start a dairy business"))
    assert res.schemes
    for r in res.schemes:
        assert r.eligibility_counts.not_matched == 0
        assert r.eligibility_counts.needs_verification >= 1


def test_wrong_category_and_high_income_are_reported(db):
    res = RecommendationService(db).recommend(RecommendRequest(purpose="dairy business", annual_income=900000, beneficiary_category="General"))
    tl = next(r for r in res.schemes if r.scheme.id == "term-loan")
    st = {c.criterion: c.status.value for c in tl.eligibility_checks}
    assert st["Annual family income"] == "not_matched" and st["Beneficiary category"] == "not_matched"
    assert tl.eligibility_outcome.value == "MISMATCH_FOUND"


def test_education_request_matches_els(db):
    res = RecommendationService(db).recommend(RecommendRequest(purpose="college fees for engineering course", project_cost=800000, loan_required=600000,
                                                               annual_income=300000, beneficiary_category="SC", education_level="undergraduate"))
    els = next(r for r in res.schemes if r.scheme.id == "educational-loan-scheme")
    assert els.eligibility_outcome.value == "NO_MISMATCH_FOUND"


def test_tamil_and_hindi_text_is_accepted_and_language_detected(db):
    ta = RecommendationService(db).recommend(RecommendRequest(purpose="பால் தொழில் தொடங்க கடன்"))
    hi = RecommendationService(db).recommend(RecommendRequest(purpose="डेयरी व्यवसाय के लिए ऋण"))
    assert ta.retrieval.detected_language == "ta" and hi.retrieval.detected_language == "hi"
