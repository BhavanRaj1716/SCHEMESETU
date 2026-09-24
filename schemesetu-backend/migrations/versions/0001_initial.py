"""initial schema: pgvector extension, schemes, eligibility_rules, scheme_source_versions, channel_partners, users

Revision ID: 0001
Revises:
"""
import sqlalchemy as sa
from alembic import op
from pgvector.sqlalchemy import Vector

from app.core.config import get_settings

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None

DIM = get_settings().embedding_dim
STATUS = "data_status IN ('LIVE','VERIFIED','DEMO')"


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "schemes",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("scheme_code", sa.String(64), nullable=False, unique=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("purpose", sa.Text()),
        sa.Column("category", sa.String(64)),
        sa.Column("description", sa.Text()),
        sa.Column("beneficiary_category", sa.JSON()),
        sa.Column("state_scope", sa.String(64)),
        sa.Column("district_scope", sa.String(64)),
        sa.Column("eligibility_summary", sa.Text()),
        sa.Column("min_project_cost", sa.Numeric(14, 2)),
        sa.Column("max_project_cost", sa.Numeric(14, 2)),
        sa.Column("min_loan_amount", sa.Numeric(14, 2)),
        sa.Column("max_loan_amount", sa.Numeric(14, 2)),
        sa.Column("coverage_percentage", sa.Numeric(5, 2)),
        sa.Column("interest_rate", sa.Numeric(5, 2)),
        sa.Column("interest_rate_text", sa.Text()),
        sa.Column("interest_rate_options", sa.JSON()),
        sa.Column("repayment_period", sa.Text()),
        sa.Column("max_repayment_months", sa.Integer()),
        sa.Column("moratorium", sa.Text()),
        sa.Column("moratorium_months", sa.Integer()),
        sa.Column("required_documents", sa.JSON()),
        sa.Column("application_process", sa.Text()),
        sa.Column("official_application_url", sa.String(512)),
        sa.Column("applicable_activities", sa.JSON()),
        sa.Column("source_organization", sa.String(255)),
        sa.Column("source_url", sa.String(512)),
        sa.Column("source_document", sa.String(255)),
        sa.Column("last_verified_at", sa.Date()),
        sa.Column("data_updated_at", sa.Date()),
        sa.Column("data_status", sa.String(16), nullable=False, server_default="VERIFIED"),
        sa.Column("search_text", sa.Text()),
        sa.Column("embedding", Vector(DIM)),
        sa.Column("embedding_model", sa.String(255)),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.text("true")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(STATUS, name="ck_schemes_data_status"),
    )
    op.create_index("ix_schemes_category", "schemes", ["category"])
    # Approximate-nearest-neighbour index for cosine distance (pgvector >= 0.5).
    op.create_index("ix_schemes_embedding_hnsw", "schemes", ["embedding"], postgresql_using="hnsw", postgresql_ops={"embedding": "vector_cosine_ops"})

    op.create_table(
        "eligibility_rules",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("scheme_id", sa.String(64), sa.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("criterion", sa.String(255), nullable=False),
        sa.Column("field", sa.String(64), nullable=False),
        sa.Column("operator", sa.String(16), nullable=False),
        sa.Column("value", sa.JSON()),
        sa.Column("unit", sa.String(32)),
        sa.Column("description", sa.Text()),
        sa.Column("amended_from_time_to_time", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("source_organization", sa.String(255)),
        sa.Column("source_url", sa.String(512)),
        sa.Column("source_document", sa.String(255)),
        sa.Column("effective_from", sa.Date()),
        sa.Column("effective_to", sa.Date()),
        sa.Column("last_verified_at", sa.Date()),
        sa.Column("data_status", sa.String(16), nullable=False, server_default="VERIFIED"),
        sa.CheckConstraint(STATUS, name="ck_rules_data_status"),
    )
    op.create_index("ix_rules_scheme_field", "eligibility_rules", ["scheme_id", "field"])

    op.create_table(
        "scheme_source_versions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("scheme_id", sa.String(64), sa.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("field_name", sa.String(64), nullable=False),
        sa.Column("old_value", sa.JSON()),
        sa.Column("new_value", sa.JSON()),
        sa.Column("source_url", sa.String(512)),
        sa.Column("verified_at", sa.Date()),
        sa.Column("effective_from", sa.Date()),
        sa.Column("effective_to", sa.Date()),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_scheme_source_versions_scheme_id", "scheme_source_versions", ["scheme_id"])

    op.create_table(
        "channel_partners",
        sa.Column("id", sa.String(64), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("type", sa.String(32), nullable=False),
        sa.Column("state", sa.String(64)),
        sa.Column("district", sa.String(64)),
        sa.Column("address", sa.Text()),
        sa.Column("latitude", sa.Float()),
        sa.Column("longitude", sa.Float()),
        sa.Column("supported_schemes", sa.JSON()),
        sa.Column("official_source", sa.String(512)),
        sa.Column("source_document", sa.String(255)),
        sa.Column("last_verified_at", sa.Date()),
        sa.Column("data_status", sa.String(16), nullable=False, server_default="DEMO"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.CheckConstraint(STATUS, name="ck_partners_data_status"),
    )
    for col in ("type", "state", "district"):
        op.create_index(f"ix_channel_partners_{col}", "channel_partners", [col])

    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("firebase_uid", sa.String(128), nullable=False),
        sa.Column("email", sa.String(255)),
        sa.Column("phone", sa.String(32)),
        sa.Column("display_name", sa.String(255)),
        sa.Column("preferred_language", sa.String(8)),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"], unique=True)

    op.create_table(
        "saved_schemes",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("scheme_id", sa.String(64), sa.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.UniqueConstraint("user_id", "scheme_id", name="uq_saved_scheme"),
    )
    op.create_index("ix_saved_schemes_user_id", "saved_schemes", ["user_id"])

    op.create_table(
        "saved_recommendations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("request_id", sa.String(36), nullable=False),
        sa.Column("request_payload", sa.JSON(), nullable=False),
        sa.Column("response_payload", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    op.create_index("ix_saved_recommendations_user_id", "saved_recommendations", ["user_id"])


def downgrade() -> None:
    for t in ("saved_recommendations", "saved_schemes", "users", "channel_partners", "scheme_source_versions", "eligibility_rules", "schemes"):
        op.drop_table(t)
