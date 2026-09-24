from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import JSON, Boolean, CheckConstraint, Date, DateTime, ForeignKey, Index, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.config import get_settings
from app.db.database import Base, EmbeddingType

DATA_STATUSES = ("LIVE", "VERIFIED", "DEMO")
EMBEDDING_DIM = get_settings().embedding_dim


class Scheme(Base):
    __tablename__ = "schemes"
    __table_args__ = (
        CheckConstraint("data_status IN ('LIVE','VERIFIED','DEMO')", name="ck_schemes_data_status"),
        # ANN index for cosine distance; only emitted on PostgreSQL (pgvector >= 0.5).
        Index("ix_schemes_embedding_hnsw", "embedding", postgresql_using="hnsw", postgresql_ops={"embedding": "vector_cosine_ops"}),
    )

    id: Mapped[str] = mapped_column(String(64), primary_key=True)  # stable public slug, e.g. "term-loan"
    scheme_code: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[str | None] = mapped_column(Text)
    category: Mapped[str | None] = mapped_column(String(64), index=True)  # e.g. "income_generating", "education"
    description: Mapped[str | None] = mapped_column(Text)
    beneficiary_category: Mapped[list | None] = mapped_column(JSON)  # e.g. ["SC"]
    state_scope: Mapped[str | None] = mapped_column(String(64))  # "ALL_INDIA" or a state name
    district_scope: Mapped[str | None] = mapped_column(String(64))  # "ALL" or a district name
    eligibility_summary: Mapped[str | None] = mapped_column(Text)

    # Financial terms (NULL = not available from the official source; never guessed)
    min_project_cost: Mapped[float | None] = mapped_column(Numeric(14, 2))
    max_project_cost: Mapped[float | None] = mapped_column(Numeric(14, 2))
    min_loan_amount: Mapped[float | None] = mapped_column(Numeric(14, 2))
    max_loan_amount: Mapped[float | None] = mapped_column(Numeric(14, 2))
    coverage_percentage: Mapped[float | None] = mapped_column(Numeric(5, 2))
    interest_rate: Mapped[float | None] = mapped_column(Numeric(5, 2))  # rate charged to the beneficiary, % p.a.
    interest_rate_text: Mapped[str | None] = mapped_column(Text)
    interest_rate_options: Mapped[list | None] = mapped_column(JSON)  # [{"label":..., "rate":...}]
    repayment_period: Mapped[str | None] = mapped_column(Text)
    max_repayment_months: Mapped[int | None] = mapped_column(Integer)
    moratorium: Mapped[str | None] = mapped_column(Text)
    moratorium_months: Mapped[int | None] = mapped_column(Integer)

    required_documents: Mapped[list | None] = mapped_column(JSON)
    application_process: Mapped[str | None] = mapped_column(Text)
    official_application_url: Mapped[str | None] = mapped_column(String(512))
    applicable_activities: Mapped[list | None] = mapped_column(JSON)

    # Provenance
    source_organization: Mapped[str | None] = mapped_column(String(255))
    source_url: Mapped[str | None] = mapped_column(String(512))
    source_document: Mapped[str | None] = mapped_column(String(255))
    last_verified_at: Mapped[date | None] = mapped_column(Date)
    data_updated_at: Mapped[date | None] = mapped_column(Date)
    data_status: Mapped[str] = mapped_column(String(16), nullable=False, default="VERIFIED")

    # Semantic search
    search_text: Mapped[str | None] = mapped_column(Text)
    embedding: Mapped[list | None] = mapped_column(EmbeddingType(EMBEDDING_DIM))
    embedding_model: Mapped[str | None] = mapped_column(String(255))

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    rules: Mapped[list["EligibilityRule"]] = relationship(
        back_populates="scheme", cascade="all, delete-orphan", order_by="EligibilityRule.id"
    )
    versions: Mapped[list["SchemeSourceVersion"]] = relationship(
        back_populates="scheme", cascade="all, delete-orphan", order_by="SchemeSourceVersion.id"
    )


class EligibilityRule(Base):
    """One structured, versioned criterion. Evaluated deterministically by EligibilityEngine."""

    __tablename__ = "eligibility_rules"
    __table_args__ = (
        CheckConstraint("data_status IN ('LIVE','VERIFIED','DEMO')", name="ck_rules_data_status"),
        Index("ix_rules_scheme_field", "scheme_id", "field"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    criterion: Mapped[str] = mapped_column(String(255), nullable=False)  # human label
    field: Mapped[str] = mapped_column(String(64), nullable=False)
    operator: Mapped[str] = mapped_column(String(16), nullable=False)  # <=,<,>=,>,==,!=,in,not_in,between,manual
    value: Mapped[object | None] = mapped_column(JSON)
    unit: Mapped[str | None] = mapped_column(String(32))
    description: Mapped[str | None] = mapped_column(Text)
    amended_from_time_to_time: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    source_organization: Mapped[str | None] = mapped_column(String(255))
    source_url: Mapped[str | None] = mapped_column(String(512))
    source_document: Mapped[str | None] = mapped_column(String(255))
    effective_from: Mapped[date | None] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    last_verified_at: Mapped[date | None] = mapped_column(Date)
    data_status: Mapped[str] = mapped_column(String(16), nullable=False, default="VERIFIED")

    scheme: Mapped[Scheme] = relationship(back_populates="rules")


class SchemeSourceVersion(Base):
    """Audit trail: every change to a critical value keeps its old value and source."""

    __tablename__ = "scheme_source_versions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    scheme_id: Mapped[str] = mapped_column(ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name: Mapped[str] = mapped_column(String(64), nullable=False)
    old_value: Mapped[object | None] = mapped_column(JSON)
    new_value: Mapped[object | None] = mapped_column(JSON)
    source_url: Mapped[str | None] = mapped_column(String(512))
    verified_at: Mapped[date | None] = mapped_column(Date)
    effective_from: Mapped[date | None] = mapped_column(Date)
    effective_to: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    scheme: Mapped[Scheme] = relationship(back_populates="versions")
