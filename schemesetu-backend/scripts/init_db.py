"""Create tables for the configured DATABASE_URL.

- SQLite (the zero-setup local default): creates tables directly from the SQLAlchemy models.
  Alembic's migration is written for PostgreSQL/pgvector DDL (CREATE EXTENSION, Vector columns,
  an HNSW index) and does not target SQLite, so SQLite uses this script instead of `alembic upgrade`.
- PostgreSQL: refuses, and tells you to run `alembic upgrade head` instead, so the migration
  history (and pgvector extension/HNSW index) stays the single source of truth for that database.

Usage: python -m scripts.init_db
"""
import sys

from app.core.config import get_settings
from app.db import models  # noqa: F401  (registers tables on the metadata)
from app.db.database import Base, engine


def main() -> None:
    settings = get_settings()
    if engine.dialect.name != "sqlite":
        print(f"DATABASE_URL is {settings.database_url!r} (dialect={engine.dialect.name}). "
              "Use `alembic upgrade head` for PostgreSQL, not this script.", file=sys.stderr)
        raise SystemExit(1)
    Base.metadata.create_all(engine)
    print(f"SQLite tables created at {settings.database_url}")


if __name__ == "__main__":
    main()
