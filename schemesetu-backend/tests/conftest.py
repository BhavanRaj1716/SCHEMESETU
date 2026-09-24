import os

# Must be set before app modules import settings.
os.environ["DATABASE_URL"] = os.environ.get("TEST_DATABASE_URL", "sqlite:///./test.sqlite")
os.environ["EMBEDDING_PROVIDER"] = "hashing"
os.environ["SEMANTIC_MIN_SIMILARITY"] = "0.05"
os.environ["FRONTEND_URL"] = "http://localhost:3000"
os.environ["AUTH_MODE"] = "none"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.db import models  # noqa: E402,F401
from app.db.database import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.services.embedding_service import HashingEmbeddingService, set_embedding_service  # noqa: E402
from seed import seed as seed_module  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _database():
    set_embedding_service(HashingEmbeddingService(384))
    if engine.dialect.name == "postgresql":
        with engine.begin() as c:
            c.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        seed_module.run(db)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture()
def db():
    with SessionLocal() as session:
        yield session


@pytest.fixture()
def client():
    return TestClient(app)


DEMO_REQUEST = {
    "purpose": "dairy business", "projectCost": 300000, "loanRequired": 250000, "annualIncome": 250000,
    "state": "Tamil Nadu", "district": "Coimbatore", "age": 25, "beneficiaryCategory": "SC",
}
