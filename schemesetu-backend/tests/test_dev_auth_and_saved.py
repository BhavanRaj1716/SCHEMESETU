"""AUTH_MODE=dev and the saved-schemes / saved-recommendations endpoints it unlocks."""
import pytest

from app.core.security import DevVerifier, set_token_verifier


@pytest.fixture()
def dev_client(client):
    set_token_verifier(DevVerifier.__new__(DevVerifier))  # bypass the APP_ENV=production guard in __init__
    try:
        yield client
    finally:
        set_token_verifier(None)


def auth(token="dev:priya"):
    return {"Authorization": f"Bearer {token}"}


def test_dev_verifier_refuses_in_production(monkeypatch):
    from app.core.config import get_settings
    get_settings.cache_clear()
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("FRONTEND_URL", "https://example.com")
    get_settings.cache_clear()
    with pytest.raises(RuntimeError, match="AUTH_MODE=dev is not allowed"):
        DevVerifier()
    get_settings.cache_clear()


def test_dev_token_creates_a_stable_profile(dev_client):
    r1 = dev_client.post("/api/auth/register", headers=auth("dev:priya:priya@example.com"))
    r2 = dev_client.get("/api/users/me", headers=auth("dev:priya:priya@example.com"))
    assert r1.status_code == 201 and r1.json()["email"] == "priya@example.com"
    assert r2.json()["id"] == r1.json()["id"]
    other = dev_client.post("/api/auth/register", headers=auth("dev:someone-else"))
    assert other.json()["id"] != r1.json()["id"]


def test_dev_token_bare_string_also_works(dev_client):
    r = dev_client.post("/api/auth/register", headers=auth("just-a-token"))
    assert r.status_code == 201 and r.json()["displayName"]


def test_saved_schemes_round_trip(dev_client):
    h = auth("dev:asha")
    assert dev_client.get("/api/users/me/saved-schemes", headers=h).json()["count"] == 0
    saved = dev_client.post("/api/users/me/saved-schemes", json={"schemeId": "term-loan"}, headers=h)
    assert saved.status_code == 201 and saved.json()["scheme"]["id"] == "term-loan"
    again = dev_client.post("/api/users/me/saved-schemes", json={"schemeId": "term-loan"}, headers=h)
    assert again.status_code == 201  # idempotent, not a duplicate
    listed = dev_client.get("/api/users/me/saved-schemes", headers=h).json()
    assert listed["count"] == 1 and listed["savedSchemes"][0]["scheme"]["id"] == "term-loan"
    assert dev_client.delete("/api/users/me/saved-schemes/term-loan", headers=h).status_code == 204
    assert dev_client.get("/api/users/me/saved-schemes", headers=h).json()["count"] == 0


def test_saved_schemes_unknown_scheme_404(dev_client):
    r = dev_client.post("/api/users/me/saved-schemes", json={"schemeId": "nope"}, headers=auth())
    assert r.status_code == 404 and r.json()["error"]["code"] == "SCHEME_NOT_FOUND"


def test_saved_schemes_require_auth(client):
    assert client.get("/api/users/me/saved-schemes").status_code == 401


def test_saved_recommendations_round_trip(dev_client):
    h = auth("dev:asha")
    rec = dev_client.post("/api/schemes/recommend", json={"purpose": "dairy business", "projectCost": 300000, "loanRequired": 250000}).json()
    saved = dev_client.post("/api/users/me/saved-recommendations", json={"request": {"purpose": "dairy business", "projectCost": 300000, "loanRequired": 250000}, "response": rec}, headers=h)
    assert saved.status_code == 201 and saved.json()["requestId"] == rec["requestId"]
    listed = dev_client.get("/api/users/me/saved-recommendations", headers=h).json()
    assert listed["count"] == 1
    saved_id = listed["savedRecommendations"][0]["id"]
    assert dev_client.delete(f"/api/users/me/saved-recommendations/{saved_id}", headers=h).status_code == 204
    assert dev_client.get("/api/users/me/saved-recommendations", headers=h).json()["count"] == 0


def test_saved_data_is_isolated_per_user(dev_client):
    dev_client.post("/api/users/me/saved-schemes", json={"schemeId": "term-loan"}, headers=auth("dev:userA"))
    assert dev_client.get("/api/users/me/saved-schemes", headers=auth("dev:userB")).json()["count"] == 0
    assert dev_client.get("/api/users/me/saved-schemes", headers=auth("dev:userA")).json()["count"] == 1
