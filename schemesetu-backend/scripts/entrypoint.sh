#!/bin/sh
set -e
echo "Running database migrations..."
alembic upgrade head
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "Seeding verified data (idempotent)..."
  python -m seed.seed
fi
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
