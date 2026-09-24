"""Loads the manually verified NSFDC dataset into PostgreSQL, preserving history.

- Upserts schemes by id.
- If a critical financial field changed, the OLD value is kept in scheme_source_versions (never silently overwritten).
- Eligibility rules are versioned: a changed rule closes the old row (effective_to) and inserts a new one.
- Re-embeds only what changed.
"""
from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import EligibilityRule, Scheme, SchemeSourceVersion
from app.ingestion.base import SourceIngestor
from app.ingestion.nsfdc import verified_dataset as ds
from app.services.embedding_service import EmbeddingService
from app.services.semantic_search import reindex_schemes

TRACKED_FIELDS = (
    "min_project_cost", "max_project_cost", "min_loan_amount", "max_loan_amount", "coverage_percentage", "interest_rate",
    "interest_rate_text", "interest_rate_options", "repayment_period", "max_repayment_months", "moratorium", "moratorium_months",
)
SCHEME_COLUMNS = (
    "scheme_code", "name", "purpose", "category", "description", "beneficiary_category", "state_scope", "district_scope",
    "eligibility_summary", "required_documents", "application_process", "official_application_url", "applicable_activities",
    "source_organization", "source_url", "source_document", "last_verified_at", "data_updated_at", "data_status",
) + TRACKED_FIELDS


def _norm(v):
    return float(v) if v is not None and not isinstance(v, (str, list, dict, bool)) else v


class NsfdcIngestor(SourceIngestor):
    name = "nsfdc-verified-dataset"

    def __init__(self, embedder: EmbeddingService, schemes: list[dict] | None = None):
        self.embedder = embedder
        self.schemes = schemes if schemes is not None else ds.SCHEMES

    def run(self, db: Session) -> dict:
        created = updated = versions = rules_added = 0
        for data in self.schemes:
            s = db.get(Scheme, data["id"])
            is_new = s is None
            if is_new:
                s = Scheme(id=data["id"])
                db.add(s)
            for col in SCHEME_COLUMNS:
                new = data.get(col)
                old = getattr(s, col, None)
                if not is_new and col in TRACKED_FIELDS and _norm(old) != _norm(new):
                    db.add(SchemeSourceVersion(scheme_id=s.id, field_name=col, old_value=_norm(old), new_value=_norm(new),
                                               source_url=data.get("source_url"), verified_at=data.get("last_verified_at")))
                    versions += 1
                setattr(s, col, new)
            s.is_active = True
            db.flush()
            created += is_new
            updated += not is_new
            rules_added += self._sync_rules(db, s, data["rules"])
        db.commit()
        aliases = {d["id"]: d.get("search_aliases", []) for d in self.schemes}
        embedded = reindex_schemes(db, self.embedder, aliases)
        return {"created": created, "updated": updated, "versionsRecorded": versions, "rulesAdded": rules_added, "embedded": embedded}

    def _sync_rules(self, db: Session, s: Scheme, rules: list[dict]) -> int:
        added = 0
        existing = db.scalars(select(EligibilityRule).where(EligibilityRule.scheme_id == s.id, EligibilityRule.effective_to.is_(None))).all()
        by_key = {(r.field, r.criterion): r for r in existing}
        wanted_keys = set()
        for spec in rules:
            key = (spec["field"], spec["criterion"])
            wanted_keys.add(key)
            cur = by_key.get(key)
            if cur is not None:
                if cur.operator == spec["operator"] and cur.value == spec["value"]:
                    cur.last_verified_at = spec["last_verified_at"]
                    cur.description = spec["description"]
                    continue
                cutoff = spec.get("effective_from") or spec["last_verified_at"]
                cur.effective_to = cutoff - timedelta(days=1)  # keep history; close the old version
            db.add(EligibilityRule(scheme_id=s.id, **spec))
            added += 1
        for key, cur in by_key.items():  # rule removed at source
            if key not in wanted_keys:
                cur.effective_to = date.today() - timedelta(days=1)
        return added
