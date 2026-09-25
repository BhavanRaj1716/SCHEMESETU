"""Application settings, loaded from environment variables (see .env.example)."""
from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    app_version: str = "1.0.0"
    frontend_url: str = "http://localhost:3000"  # comma-separated origins

    database_url: str = "sqlite:///./schemesetu.db"  # zero-setup local default; set a postgresql+psycopg:// URL for pgvector/production

    embedding_provider: str = "sentence-transformers"  # or "hashing"
    embedding_model: str = r"E:\SIH PROTOTPYE\schemesetu_e5_final"
    embedding_dim: int = 384
    semantic_top_k: int = Field(5, ge=1, le=50)
    semantic_min_similarity: float = Field(0.05, ge=-1.0, le=1.0)

    auth_mode: str = "none"  # none | firebase | dev
    firebase_project_id: str = ""

    pm_suraj_url: str = "https://pmsuraj.dosje.gov.in/"

    @property
    def cors_origins(self) -> list[str]:
        origins = [o.strip().rstrip("/") for o in self.frontend_url.split(",") if o.strip()]
        if self.app_env == "production" and "*" in origins:
            raise ValueError("FRONTEND_URL must not contain '*' in production")
        return origins

    @property
    def is_postgres(self) -> bool:
        return self.database_url.startswith("postgresql")


@lru_cache
def get_settings() -> Settings:
    return Settings()
