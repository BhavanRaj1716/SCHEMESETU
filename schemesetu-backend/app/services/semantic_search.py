"""Semantic retrieval over scheme embeddings (pgvector on PostgreSQL; in-process cosine fallback otherwise).

Semantic similarity answers "which schemes are RELEVANT?". It is never an eligibility measure.
"""
from dataclasses import dataclass

import numpy as np
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.db.models import Scheme
from app.services.embedding_service import EmbeddingService


@dataclass
class Candidate:
    scheme: Scheme
    similarity: float


def build_search_text(s: Scheme, search_aliases: list[str] | None = None) -> str:
    """Searchable document: never just the name (spec §12)."""
    parts = [
        f"Scheme: {s.name}",
        f"Purpose: {s.purpose or ''}",
        f"Description: {s.description or ''}",
        f"Category: {s.category or ''}",
        f"Beneficiary category: {', '.join(s.beneficiary_category or [])}",
        f"Eligibility: {s.eligibility_summary or ''}",
    ]
    if s.applicable_activities:
        parts.append("Applicable activities: " + "; ".join(s.applicable_activities))
    if search_aliases:
        # Retrieval aids (our own synonyms, e.g. "dairy" for the official "Cows / Buffaloes"). Never shown as government data.
        parts.append("Also described as: " + ", ".join(search_aliases))
    return "\n".join(p for p in parts if p.split(": ", 1)[-1].strip())


def reindex_schemes(db: Session, embedder: EmbeddingService, aliases_by_scheme: dict[str, list[str]] | None = None, force: bool = False) -> int:
    schemes = db.scalars(select(Scheme).where(Scheme.is_active.is_(True))).all()
    changed = 0
    for s in schemes:
        text_ = build_search_text(s, (aliases_by_scheme or {}).get(s.id))
        if force or s.search_text != text_ or s.embedding is None or s.embedding_model != embedder.model_name:
            s.search_text = text_
            s.embedding = embedder.embed_one(text_)
            s.embedding_model = embedder.model_name
            changed += 1
    db.commit()
    return changed


def _vector_literal(vec: list[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in vec) + "]"


class SemanticSearch:
    def __init__(self, db: Session):
        self.db = db

    def search(self, query_embedding: list[float], top_k: int, min_similarity: float) -> list[Candidate]:
        if self.db.bind.dialect.name == "postgresql":
            return self._search_pgvector(query_embedding, top_k, min_similarity)
        return self._search_in_memory(query_embedding, top_k, min_similarity)

    def _search_pgvector(self, q: list[float], top_k: int, min_sim: float) -> list[Candidate]:
        rows = self.db.execute(
            text(
                "SELECT id, 1 - (embedding <=> CAST(:q AS vector)) AS sim FROM schemes "
                "WHERE is_active AND embedding IS NOT NULL "
                "ORDER BY embedding <=> CAST(:q AS vector) LIMIT :k"
            ),
            {"q": _vector_literal(q), "k": top_k},
        ).all()
        by_id = {s.id: s for s in self.db.scalars(select(Scheme).where(Scheme.id.in_([r[0] for r in rows]))).all()}
        return [Candidate(by_id[r[0]], float(r[1])) for r in rows if float(r[1]) >= min_sim]

    def _search_in_memory(self, q: list[float], top_k: int, min_sim: float) -> list[Candidate]:
        qv = np.asarray(q, dtype=float)
        qn = np.linalg.norm(qv) or 1.0
        scored = []
        for s in self.db.scalars(select(Scheme).where(Scheme.is_active.is_(True))).all():
            if not s.embedding:
                continue
            v = np.asarray(s.embedding, dtype=float)
            sim = float(np.dot(qv, v) / (qn * (np.linalg.norm(v) or 1.0)))
            scored.append(Candidate(s, sim))
        scored.sort(key=lambda c: c.similarity, reverse=True)
        return [c for c in scored[:top_k] if c.similarity >= min_sim]
