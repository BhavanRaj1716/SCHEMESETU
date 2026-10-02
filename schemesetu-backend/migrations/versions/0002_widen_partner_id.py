"""widen channel_partners.id to VARCHAR(128)

Revision ID: 0002
Revises: 0001
Create Date: 2026-10-03
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Widen the primary key column to accommodate long government agency IDs
    op.alter_column(
        "channel_partners",
        "id",
        type_=sa.String(128),
        existing_type=sa.String(64),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "channel_partners",
        "id",
        type_=sa.String(64),
        existing_type=sa.String(128),
        existing_nullable=False,
    )
