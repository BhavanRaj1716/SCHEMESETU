# SchemeSetu Backend

Scheme discovery and financial guidance over **verified NSFDC data**. FastAPI + PostgreSQL/pgvector, consumed by a separate Next.js frontend through a stable REST API. The official application always happens on **PM-SURAJ** (https://pmsuraj.dosje.gov.in/); this backend never approves loans or predicts approval.

## 1. Architecture

```
Official sources (NSFDC pages) ──► ingestion (manual-verification workflow, separate from the API)
        │                                   │ records provenance + history
        ▼                                   ▼
                     PostgreSQL  (schemes · eligibility_rules · scheme_source_versions · channel_partners · users · pgvector embeddings)
                                            │
 Next.js ──► REST API ──► validate ► normalise ► embed ► pgvector search ► EligibilityEngine ► verified data ► JSON
```

Two independent systems, never blended into one score:
- **Semantic search** – "which schemes are relevant?" (embeddings, cosine similarity).
- **Eligibility engine** – "do the supplied facts satisfy the published criteria?" Deterministic rules stored in the DB; each check is `matched | not_matched | needs_verification`. Missing input is never treated as pass or fail. No LLM is involved in decisions.

```
app/
  api/            routes (schemes, recommendations, calculator, partners, auth, health), errors, dependencies
  core/           config (env), security (Firebase ID-token verification)
  db/             engine/session, EmbeddingType (pgvector on Postgres), models/
  schemas/        Pydantic request/response models (camelCase JSON)
  services/       recommendation, semantic_search, embedding, eligibility_engine, calculator, partner, scheme, source_verification
  ingestion/      base contract, nsfdc/ (verified dataset + loader), data_gov/ & myscheme/ (documented, not implemented)
  utils/          text normalisation, language detection, INR formatting
migrations/       Alembic (0001_initial creates pgvector extension, tables, HNSW index)
seed/             seed.py (idempotent), demo_partners.py (DEMO only)
tests/  scripts/  docs/API_CONTRACT.md  docs/NEXTJS_INTEGRATION.md  docs/examples/
```

## 2. Stack
Python 3.12 · FastAPI · Pydantic v2 · SQLAlchemy 2 · Alembic · PostgreSQL 16 + pgvector · sentence-transformers (multilingual MiniLM, 384-dim) · pytest · Uvicorn.

## 3. Quick start — zero setup (SQLite, no services to install)

The default `DATABASE_URL` is SQLite, and semantic search falls back to an in-process cosine
search on this database (see §6) — no PostgreSQL, no Docker, no external service needed to get
the API running and try every endpoint.

```bash
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python -m scripts.init_db       # creates schemesetu.db (SQLite) directly from the models
python -m seed.seed             # idempotent: verified NSFDC schemes + verified/DEMO partners
uvicorn app.main:app --reload   # API on http://localhost:8000, docs at /api/docs
```

`AUTH_MODE=dev` is the `.env.example` default, so `/api/users/me`, saved-schemes and
saved-recommendations work immediately with any bearer token — see §7. `EMBEDDING_PROVIDER`
defaults to `sentence-transformers` (needs `pip install -r requirements-ml.txt`, large PyTorch
download); without it, set `EMBEDDING_PROVIDER=hashing` in `.env` for a dependency-free lexical
fallback that still runs the whole API and passes the demo scenario (see §6).

**This is what to zip and hand to someone else to integrate against**: SQLite ships as a plain
file created by `scripts/init_db.py`, so there is no separate database service they need to stand
up first — `pip install`, `init_db`, `seed`, `uvicorn`, done.

## 4. Production setup (Docker + PostgreSQL + pgvector)

Use this for a real deployment or to exercise the exact pgvector-accelerated search path.

```bash
cp .env.example .env
# then set DATABASE_URL=postgresql+psycopg://... in .env, or use compose's own default below
docker compose up --build       # API on http://localhost:8000, docs at /api/docs
```
The container runs `alembic upgrade head` (the migration targets PostgreSQL/pgvector DDL, not
SQLite — see `scripts/init_db.py`'s docstring) and, with `SEED_ON_START=true` (set in compose),
`python -m seed.seed`. Lighter image / no model download: `INSTALL_ML=false EMBEDDING_PROVIDER=hashing docker compose up --build`.

Without Docker: install PostgreSQL 15+ with pgvector (e.g. `pgvector/pgvector:pg16`, or
`apt install postgresql-16-pgvector`), `createdb schemesetu`, set `DATABASE_URL` in `.env`, then
`alembic upgrade head` (creates the `vector` extension — needs a role allowed to `CREATE EXTENSION`
— tables, and an HNSW index) followed by `python -m seed.seed`.

## 5. Environment variables (`.env.example`)
`APP_ENV`, `FRONTEND_URL` (comma-separated allowed origins; `*` is rejected in production), `DATABASE_URL` (SQLite by default; PostgreSQL for production/pgvector), `EMBEDDING_PROVIDER` (`sentence-transformers`|`hashing`), `EMBEDDING_MODEL`, `EMBEDDING_DIM`, `SEMANTIC_TOP_K`, `SEMANTIC_MIN_SIMILARITY`, `AUTH_MODE` (`none`|`dev`|`firebase` — see §7), `FIREBASE_PROJECT_ID`, `GOOGLE_APPLICATION_CREDENTIALS`, `PM_SURAJ_URL`. Never commit `.env` or credentials.
Changing `EMBEDDING_MODEL`/`EMBEDDING_DIM` needs a re-run of `python -m seed.seed` (schemes re-embed when the model name changes); on PostgreSQL it also needs a new migration for the vector column size.

## 6. Local database & search: SQLite vs PostgreSQL

- **SQLite (default)**: `scripts/init_db.py` creates tables from the SQLAlchemy models directly.
  `semantic_search.py` falls back to an in-process cosine search (numpy) over embeddings stored as
  JSON — same relevance logic and results as pgvector, just without the ANN index, which only
  matters at a scale far beyond this dataset (5 schemes). This is what §3's zero-setup path uses.
- **PostgreSQL + pgvector (production)**: `alembic upgrade head` creates the `vector` extension, an
  HNSW index, and the same tables. `semantic_search.py` automatically uses the pgvector `<=>`
  cosine-distance operator instead of the in-process path when it detects a PostgreSQL connection —
  no code or config change needed beyond `DATABASE_URL`.
- Switching `DATABASE_URL` between the two: SQLite data is **not** migrated to PostgreSQL
  automatically. Re-run `alembic upgrade head` + `python -m seed.seed` against the new database.

## 7. Auth modes

- `AUTH_MODE=none` — auth endpoints (`/api/auth/*`, `/api/users/me`, saved-schemes,
  saved-recommendations) return `401`. Scheme/calculator/partner/health endpoints stay public.
- `AUTH_MODE=dev` (**`.env.example` default**) — `DevVerifier` (`app/core/security.py`) trusts any
  bearer token as a user id, with no password or signature check, so a frontend developer can build
  and test profile/saved-schemes screens before Firebase is wired up. Send
  `Authorization: Bearer dev:<any-name>` (e.g. `dev:priya`) — the same token always maps to the same
  dev user. **This mode refuses to start if `APP_ENV=production`** — it must never reach a real
  deployment; switch to `firebase` before deploying.
- `AUTH_MODE=firebase` — verifies real Firebase ID tokens (see `FirebaseVerifier`). No passwords are
  ever stored by this backend in any mode.

**Saved schemes / saved recommendations** (bearer token required, any auth mode above):
`GET/POST /api/users/me/saved-schemes`, `DELETE /api/users/me/saved-schemes/{schemeId}`,
`GET/POST /api/users/me/saved-recommendations`, `DELETE /api/users/me/saved-recommendations/{id}`.
These wire up the `SavedScheme`/`SavedRecommendation` models that existed in the schema but had no
endpoints in the original build.

## 8. Embeddings & tuning (please read)
- **Production/demo:** `sentence-transformers` with a multilingual model (English/Tamil/Hindi in one vector space).
- **`hashing` fallback:** dependency-free bag-of-words hashing used by the tests and offline runs. It is *lexical*, not semantic, and its similarity values are small (~0.1).
- `SEMANTIC_MIN_SIMILARITY` decides which schemes are returned at all. The default `0.15` is a starting guess for the MiniLM model. **Tune it on your machine:**
  `python -m scripts.check_retrieval "I need ₹3 lakh to start a dairy business" "college fees for engineering"` prints similarities for every scheme.
- Retrieval aids: seed data includes `search_aliases` (e.g. "dairy" for the official "Cows / Buffaloes") that feed embeddings only and are never shown as government data.

## 9. Migrations, seed, tests
```bash
python -m scripts.init_db     # SQLite: create tables directly (see §6)
alembic upgrade head          # PostgreSQL: apply   |  alembic downgrade base   # revert
alembic check                 # PostgreSQL: models and migration must agree
python -m seed.seed           # either database: load/refresh verified data (records history if a value changed)
pytest -q                     # SQLite + hashing embedder, no services needed
TEST_DATABASE_URL=postgresql+psycopg://user:pass@localhost:5432/schemesetu_test pytest -q   # real pgvector path (drops/recreates tables in that DB!)
```

## 10. API documentation
OpenAPI is generated by FastAPI: `/api/docs`, `/api/redoc`, `/openapi.json` (disabled when `APP_ENV=production`). Human contract: [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md). Frontend guide with TypeScript types: [`docs/NEXTJS_INTEGRATION.md`](docs/NEXTJS_INTEGRATION.md).

## 11. Government data provenance
Every scheme, eligibility rule and partner stores `source_organization`, `source_url`, `source_document`, `last_verified_at`, `data_updated_at` (if published) and `data_status`.
**Verified 2026-09-22** against the current official NSFDC pages: `https://nsfdc.nic.in/scheme` (five schemes' financial terms), `/eligibility-requirements` (SC beneficiaries; annual family income ≤ ₹5,00,000 for credit schemes, effective 7 Jan 2026) and `/indicative-activities`. The five schemes' figures matched the original prototype specification.
Some third-party sites show different figures (e.g. ELS "₹30 lakh", Aajeevika "11%", income "₹3 lakh"); they are **not** official NSFDC pages and were not used. The comments in `app/ingestion/nsfdc/verified_dataset.py` record this.

**Updating data (manual verification workflow):** edit `verified_dataset.py` from the official page → bump `LAST_VERIFIED` → `python -m seed.seed`. Changed financial values are copied to `scheme_source_versions`; a changed eligibility rule closes the old row (`effective_to`) and inserts a new one, so history is preserved and thresholds are never hard-coded in code.
- `required_documents` is `NULL`: the official pages fetched do not list them, so the API reports *"Information currently unavailable — please verify with the official source."*
- `data.gov.in` and `myScheme` ingestion are documented stubs (no fabricated statistics; myScheme is not scraped without authorisation).
- **Partners:** NSFDC does not publish a structured, geocoded, all-India partner directory. Two records are `VERIFIED`: **TAHDCO** (Tamil Nadu's real State Channelizing Agency — HQ address and phone independently confirmed by TAHDCO's own site and multiple Tamil Nadu district-government `.nic.in` portals) and a historical **Syndicate Bank** record for the PSB channel used in Tamil Nadu, sourced from NSFDC's own 2020 evaluation report (`socialjustice.gov.in`) — Syndicate Bank was amalgamated into Canara Bank on 1 April 2020, noted rather than silently renamed. That same report is the source for the aggregate "37 SCAs + 55 other Channelizing Agencies = 92 nationally" figure surfaced in the `GET /api/partners` `notice` field. Everything else (individual bank/NBFC-MFI branch addresses) is `DEMO` — clearly labelled, not sourced from anywhere official, included only to exercise the map/list UI. See `app/ingestion/nsfdc/verified_partners.py` for full source notes and the coordinate-provenance caveat (city-level geocoding of the real address, not official GPS data).

## 12. Data status definitions
`LIVE` – retrieved from an official live/API source · `VERIFIED` – manually verified from an official page/document · `DEMO` – simulated, must be labelled as such and never shown as real.

## 13. Security
Env-only secrets; `.env` git-ignored; Pydantic validation on all input; explicit CORS origins (`FRONTEND_URL`); no passwords stored (Firebase ID-token verification only); internal errors never leak details; non-root Docker user; API docs off in production. Add rate limiting (e.g. at the gateway) before public launch.

## 14. Deployment
```
Next.js  → Firebase App Hosting      (env: NEXT_PUBLIC_API_BASE_URL=https://<api-url>)
FastAPI  → Cloud Run (or any container host with HTTPS + secrets)
Postgres → managed PostgreSQL with pgvector (Cloud SQL, Neon, Supabase, …)
```
1. Provision managed PostgreSQL, enable `vector`, note the connection string.
2. Deploy the container to Cloud Run, e.g. `gcloud run deploy schemesetu-api --source . --region <r> --memory 2Gi --set-env-vars APP_ENV=production,FRONTEND_URL=https://<frontend-domain>,EMBEDDING_PROVIDER=sentence-transformers` and supply `DATABASE_URL` (and Firebase settings) through Secret Manager. The sentence-transformers model needs ~2 GiB RAM; use `INSTALL_ML=false` + `hashing` only for throw-away demos. For Cloud SQL, use the `?host=/cloudsql/PROJECT:REGION:INSTANCE` socket form in `DATABASE_URL`.
3. The entrypoint runs `alembic upgrade head`; seed once with `SEED_ON_START=true` (idempotent) or run `python -m seed.seed` as a job.
4. Set the frontend's `NEXT_PUBLIC_API_BASE_URL` to the Cloud Run URL and the backend's `FRONTEND_URL` to the App Hosting URL (comma-separate preview/prod origins).
Check the current Firebase App Hosting and Cloud Run documentation for exact config-file syntax; those steps were not executed here.

## 15. Status of this build — what was and wasn't verified
Verified in development: 68 pytest tests pass on SQLite **and** on real PostgreSQL 16 + pgvector 0.6 (migration `upgrade`/`downgrade`, `alembic check` clean, HNSW index, `<=>` vector query, seed, demo scenario). Also verified: a simulated "fresh clone" run (`python -m venv`, `pip install -r requirements.txt` only, no ML deps, `EMBEDDING_PROVIDER=hashing`) — `scripts/init_db.py`, `seed.seed`, `uvicorn`, and a live request to `/api/schemes/recommend` all worked end-to-end with no PostgreSQL or Docker installed. This is the path a friend running only `pip install`, `init_db`, `seed`, `uvicorn` would hit.
**Not run:** the `sentence-transformers` model itself (couldn't be downloaded in the build sandbox — tune `SEMANTIC_MIN_SIMILARITY` per §8 once you have it), `docker compose` / the Dockerfile, Firebase token verification against real Firebase, and any cloud deployment.
