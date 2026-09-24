import copy

from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base
from app.db.models import EligibilityRule, Scheme, SchemeSourceVersion
from app.ingestion.nsfdc import verified_dataset as ds
from app.ingestion.nsfdc.loader import NsfdcIngestor
from app.services.embedding_service import HashingEmbeddingService


def fresh_db():
    eng = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(eng)
    return sessionmaker(bind=eng, expire_on_commit=False)()


def test_ingest_is_idempotent_and_records_no_versions_without_changes():
    db = fresh_db()
    emb = HashingEmbeddingService(384)
    first = NsfdcIngestor(emb).run(db)
    second = NsfdcIngestor(emb).run(db)
    assert first["created"] == 5 and second["created"] == 0 and second["versionsRecorded"] == 0 and second["rulesAdded"] == 0
    assert db.query(Scheme).count() == 5


def test_changed_official_value_keeps_history_and_versions_rules():
    db = fresh_db()
    emb = HashingEmbeddingService(384)
    NsfdcIngestor(emb).run(db)

    changed = copy.deepcopy(ds.SCHEMES)
    tl = next(s for s in changed if s["id"] == "term-loan")
    tl["interest_rate"] = 9
    next(r for r in tl["rules"] if r["field"] == "annual_family_income")["value"] = 600000
    summary = NsfdcIngestor(emb, changed).run(db)

    assert summary["versionsRecorded"] == 1 and summary["rulesAdded"] == 1
    v = db.scalar(select(SchemeSourceVersion).where(SchemeSourceVersion.scheme_id == "term-loan"))
    assert (v.field_name, v.old_value, v.new_value) == ("interest_rate", 8.0, 9.0) and v.source_url
    rules = db.scalars(select(EligibilityRule).where(EligibilityRule.scheme_id == "term-loan", EligibilityRule.field == "annual_family_income")).all()
    assert len(rules) == 2
    old = next(r for r in rules if r.value == 500000)
    new = next(r for r in rules if r.value == 600000)
    assert old.effective_to is not None and new.effective_to is None  # old kept, closed


def test_every_seeded_scheme_has_provenance_and_verified_status(db):
    for s in db.scalars(select(Scheme)).all():
        assert s.source_organization == "NSFDC" and s.source_url.startswith("https://nsfdc.nic.in")
        assert s.last_verified_at and s.data_status == "VERIFIED" and s.embedding is not None
        assert all(r.source_url and r.last_verified_at for r in s.rules)
