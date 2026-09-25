import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.api.errors import register_error_handlers
from app.api.routes import auth, calculator, health, partners, recommendations, saved, schemes
from app.core.config import get_settings

logging.basicConfig(level=logging.INFO)
settings = get_settings()
is_prod = settings.app_env == "production"

app = FastAPI(
    title="SchemeSetu API",
    version=settings.app_version,
    description="Scheme discovery and financial guidance over verified NSFDC data. Semantic relevance and "
                "deterministic eligibility checks are separate. This API never approves loans.",
    docs_url=None if is_prod else "/api/docs",
    redoc_url=None if is_prod else "/api/redoc",
    openapi_url=None if is_prod else "/openapi.json",
)

# GZip all responses ≥ 500 bytes (JSON compresses ~70%, woff2/images skip automatically)
app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,  # explicit origins from FRONTEND_URL; never "*"
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
register_error_handlers(app)

# NOTE: recommendations router must be included before schemes so "/recommend" is never shadowed by "/{scheme_id}" (different methods, but explicit is safer).
for r in (recommendations.router, schemes.router, calculator.router, partners.router, auth.router, saved.router, health.router):
    app.include_router(r)
