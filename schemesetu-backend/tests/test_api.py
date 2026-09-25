import pytest

from app.core.security import AuthenticatedUser, AuthError, TokenVerifier, set_token_verifier
from tests.conftest import DEMO_REQUEST


# --- recommend -----------------------------------------------------------------
def test_recommend_demo_scenario_contract(client):
    r = client.post("/api/schemes/recommend", json=DEMO_REQUEST)
    assert r.status_code == 200
    body = r.json()
    assert set(body) >= {"requestId", "dataStatus", "schemes", "retrieval", "officialApplicationUrl", "disclaimer"}
    tl = next(s for s in body["schemes"] if s["scheme"]["id"] == "term-loan")
    fd = tl["scheme"]["financialDetails"]
    assert fd["maxLoanAmount"] == 4500000 and fd["interestRate"] == 8
    assert "7 years" in fd["repaymentPeriod"] and "6 months" in fd["moratorium"]
    assert tl["scheme"]["officialSource"]["organization"] == "NSFDC"
    assert tl["scheme"]["officialSource"]["lastVerified"] == "2026-09-22"
    assert tl["scheme"]["officialSource"]["dataStatus"] == "VERIFIED"
    assert tl["relevanceReason"] and tl["requiresVerification"] is True
    assert {c["status"] for c in tl["eligibilityChecks"]} <= {"matched", "not_matched", "needs_verification"}
    assert tl["officialApplicationUrl"] == "https://pmsuraj.dosje.gov.in/"


def test_recommend_validation_errors_use_error_envelope(client):
    r = client.post("/api/schemes/recommend", json={**DEMO_REQUEST, "projectCost": 0})
    assert r.status_code == 422
    err = r.json()["error"]
    assert err["code"] == "INVALID_REQUEST" and "projectCost" in err["message"] and "details" in err


def test_recommend_loan_above_cost_rejected(client):
    r = client.post("/api/schemes/recommend", json={"purpose": "dairy business", "projectCost": 100000, "loanRequired": 200000})
    assert r.status_code == 422 and "loanRequired" in r.json()["error"]["message"]


def test_recommend_only_purpose_required(client):
    assert client.post("/api/schemes/recommend", json={"purpose": "dairy business"}).status_code == 200
    assert client.post("/api/schemes/recommend", json={}).status_code == 422


def test_snake_case_request_keys_are_not_the_contract(client):
    # populate_by_name keeps internal use easy, but the documented contract is camelCase.
    r = client.post("/api/schemes/recommend", json={"purpose": "dairy business", "projectCost": 300000})
    assert r.status_code == 200 and "requestId" in r.json()


# --- schemes -------------------------------------------------------------------
def test_list_schemes_and_filters(client):
    body = client.get("/api/schemes").json()
    assert body["count"] == 5
    assert {s["id"] for s in body["schemes"]} == {"micro-finance-scheme", "term-loan", "aajeevika-micro-finance-yojana", "udyam-nidhi-yojana", "educational-loan-scheme"}
    assert client.get("/api/schemes", params={"category": "education"}).json()["count"] == 1
    assert client.get("/api/schemes", params={"beneficiaryCategory": "SC"}).json()["count"] == 5
    assert client.get("/api/schemes", params={"beneficiaryCategory": "ST"}).json()["count"] == 0
    assert client.get("/api/schemes", params={"purpose": "cows"}).json()["count"] == 4
    assert client.get("/api/schemes", params={"state": "Tamil Nadu"}).json()["count"] == 5


def test_scheme_detail_has_provenance_and_versioned_rules(client):
    d = client.get("/api/schemes/term-loan").json()
    assert d["officialSource"]["url"] == "https://nsfdc.nic.in/scheme"
    income = next(r for r in d["eligibilityRules"] if r["field"] == "annual_family_income")
    assert income["value"] == 500000 and income["effectiveFrom"] == "2026-01-07" and income["lastVerified"] == "2026-09-22"
    assert d["requiredDocuments"] is None and "requiredDocuments" in d["unavailableFields"]
    assert d["unavailableMessage"] == "Information currently unavailable — please verify with the official source."
    uny = client.get("/api/schemes/udyam-nidhi-yojana").json()["financialDetails"]
    assert uny["interestRate"] is None and {o["rate"] for o in uny["interestRateOptions"]} == {13, 15}


def test_scheme_not_found(client):
    r = client.get("/api/schemes/nope")
    assert r.status_code == 404 and r.json()["error"]["code"] == "SCHEME_NOT_FOUND"


# --- calculator ----------------------------------------------------------------
def test_calculator_endpoint(client):
    r = client.post("/api/calculator/emi", json={"principal": 250000, "annualInterestRate": 8, "tenureMonths": 84})
    assert r.status_code == 200
    b = r.json()
    assert set(b) >= {"emi", "totalInterest", "totalRepayment", "assumptions"}
    assert b["assumptions"] == {"interestRate": 8.0, "tenureMonths": 84, "frequency": "monthly", "moratoriumMonths": 0, "moratoriumInterestTreatment": "needs_verification"}
    assert b["totalRepayment"] == pytest.approx(b["emi"] * 84, abs=1)


@pytest.mark.parametrize("payload", [{"principal": 0, "annualInterestRate": 8, "tenureMonths": 12},
                                     {"principal": 1000, "annualInterestRate": -1, "tenureMonths": 12},
                                     {"principal": 1000, "annualInterestRate": 8, "tenureMonths": 6, "moratoriumMonths": 6}])
def test_calculator_validation(client, payload):
    r = client.post("/api/calculator/emi", json=payload)
    assert r.status_code == 422 and r.json()["error"]["code"] == "INVALID_REQUEST"


# --- partners ------------------------------------------------------------------
def test_partners_list_filters_and_demo_labelling(client):
    b = client.get("/api/partners").json()
    assert b["count"] >= 7 and ("DEMO" in b["notice"] or "State Channelizing Agencies" in b["notice"])
    assert client.get("/api/partners", params={"state": "Tamil Nadu", "district": "Coimbatore"}).json()["count"] >= 1
    assert client.get("/api/partners", params={"scheme": "udyam-nidhi-yojana"}).json()["count"] >= 1
    assert client.get("/api/partners", params={"type": "NBFC-MFI"}).json()["count"] >= 1


def test_partners_include_real_verified_sca_record(client):
    b = client.get("/api/partners", params={"type": "SCA", "state": "Tamil Nadu"}).json()
    assert b["count"] >= 1
    tahdco = next(p for p in b["partners"] if p["dataStatus"] == "VERIFIED")
    assert tahdco["dataStatus"] == "VERIFIED" and tahdco["name"].startswith("Tamil Nadu Adi Dravidar")
    assert tahdco["officialSource"]["url"] in ("https://tahdco.com/contact-us.php", "https://nsfdc.nic.in/our-channel-partners")
    assert tahdco["officialSource"]["dataStatus"] == "VERIFIED"


def test_partners_radius_filter_and_sorting(client):
    b = client.get("/api/partners", params={"latitude": 11.0168, "longitude": 76.9558, "radius": 10}).json()
    assert b["count"] == 4 and b["partners"][0]["distanceKm"] < 1
    assert [p["distanceKm"] for p in b["partners"]] == sorted(p["distanceKm"] for p in b["partners"])
    assert client.get("/api/partners", params={"radius": 10}).status_code == 422


def test_partner_detail_never_fabricates_health_data(client):
    p = client.get("/api/partners/demo-sca-cbe").json()
    assert p["fundHealth"] == {"available": False, "message": "Partner-level fund-health information is not available in the current verified dataset."}
    assert not {"npa", "approvalRate", "processingTime", "ranking", "reliabilityScore"} & set(p)
    r = client.get("/api/partners/none")
    assert r.status_code == 404 and r.json()["error"]["code"] == "PARTNER_NOT_FOUND"


# --- health / docs / cors --------------------------------------------------------
def test_health(client):
    b = client.get("/api/health").json()
    assert b["status"] == "ok" and b["database"] == "connected" and b["vectorSearch"] in ("available", "fallback") and b["version"]
    assert "password" not in str(b).lower() and "postgresql" not in str(b).lower()


def test_openapi_docs_available_in_development(client):
    assert client.get("/openapi.json").status_code == 200
    assert client.get("/api/docs").status_code == 200 and client.get("/api/redoc").status_code == 200


def test_cors_is_explicit_not_wildcard(client):
    ok = client.options("/api/health", headers={"Origin": "http://localhost:3000", "Access-Control-Request-Method": "GET"})
    assert ok.headers.get("access-control-allow-origin") == "http://localhost:3000"
    bad = client.options("/api/health", headers={"Origin": "http://evil.example", "Access-Control-Request-Method": "GET"})
    assert "access-control-allow-origin" not in bad.headers


# --- auth ------------------------------------------------------------------------
class FakeVerifier(TokenVerifier):
    def verify(self, token):
        if token != "good":
            raise AuthError("Invalid or expired ID token.")
        return AuthenticatedUser(uid="uid-1", email="a@example.com", display_name="Asha")


def test_auth_requires_valid_firebase_token(client):
    assert client.get("/api/users/me").status_code == 401
    r = client.get("/api/users/me", headers={"Authorization": "Bearer whatever"})
    assert r.status_code == 401 and r.json()["error"]["code"] == "UNAUTHORIZED"  # AUTH_MODE=none in tests

    set_token_verifier(FakeVerifier())
    try:
        assert client.get("/api/users/me", headers={"Authorization": "Bearer bad"}).status_code == 401
        h = {"Authorization": "Bearer good"}
        reg = client.post("/api/auth/register", headers=h)
        assert reg.status_code == 201 and reg.json()["email"] == "a@example.com"
        assert client.post("/api/auth/login", headers=h).json()["id"] == reg.json()["id"]
        assert client.get("/api/users/me", headers=h).json()["displayName"] == "Asha"
        assert client.post("/api/auth/logout").status_code == 200
    finally:
        set_token_verifier(None)
