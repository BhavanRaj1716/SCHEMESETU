"""Embedding abstraction. Swap providers via EMBEDDING_PROVIDER without touching callers."""
import hashlib
import math
import re
from abc import ABC, abstractmethod

from app.core.config import get_settings


class EmbeddingService(ABC):
    provider: str
    model_name: str
    dim: int

    @abstractmethod
    def embed(self, texts: list[str]) -> list[list[float]]: ...

    def embed_one(self, text: str) -> list[float]:
        return self.embed([text])[0]


_STOP = {
    "i", "me", "my", "a", "an", "the", "to", "for", "of", "and", "or", "in", "on", "at", "is", "are", "be", "need",
    "want", "would", "like", "get", "start", "starting", "please", "loan", "lakh", "rs", "inr", "with", "from", "by",
    "this", "that", "it", "as", "small",
}
_TOKEN = re.compile(r"[\w\u0900-\u097f\u0b80-\u0bff]+", re.UNICODE)


def _stem(tok: str) -> str:
    for suffix in ("ing", "es", "s"):
        if tok.endswith(suffix) and len(tok) > len(suffix) + 2:
            return tok[: -len(suffix)]
    return tok


class HashingEmbeddingService(EmbeddingService):
    """Dependency-free feature-hashing bag-of-words embedding.

    This is a LEXICAL fallback (word overlap), not a semantic model. It exists so tests and
    offline demos run without downloading a neural model. Use `sentence-transformers` in real use.
    """

    provider = "hashing"

    def __init__(self, dim: int = 384):
        self.dim = dim
        self.model_name = f"hashing-bow-{dim}"

    def _features(self, text: str) -> list[str]:
        toks = [_stem(t) for t in _TOKEN.findall(text.lower()) if t not in _STOP and not t.isdigit()]
        return toks

    def embed(self, texts: list[str]) -> list[list[float]]:
        out = []
        for text in texts:
            vec = [0.0] * self.dim
            for feat in self._features(text):
                h = int(hashlib.md5(feat.encode("utf-8")).hexdigest(), 16)
                vec[h % self.dim] += 1.0 if (h >> 64) % 2 == 0 else -1.0
            norm = math.sqrt(sum(v * v for v in vec)) or 1.0
            out.append([v / norm for v in vec])
        return out


class SentenceTransformerEmbeddingService(EmbeddingService):
    provider = "sentence-transformers"

    def __init__(self, model_name: str, dim: int):
        self.model_name = model_name
        self.dim = dim
        self._model = None

    def _load(self):
        if self._model is None:
            try:
                from sentence_transformers import SentenceTransformer
            except ImportError as exc:  # pragma: no cover
                raise RuntimeError(
                    "sentence-transformers is not installed. `pip install -r requirements-ml.txt` "
                    "or set EMBEDDING_PROVIDER=hashing for a lexical fallback."
                ) from exc
            self._model = SentenceTransformer(self.model_name)
            actual = self._model.get_sentence_embedding_dimension()
            if actual != self.dim:
                raise RuntimeError(f"EMBEDDING_DIM={self.dim} but model produces {actual}-dim vectors")
        return self._model

    def embed(self, texts: list[str]) -> list[list[float]]:
        vecs = self._load().encode(texts, normalize_embeddings=True)
        return [list(map(float, v)) for v in vecs]


_service: EmbeddingService | None = None


def get_embedding_service() -> EmbeddingService:
    global _service
    if _service is None:
        s = get_settings()
        if s.embedding_provider == "hashing":
            _service = HashingEmbeddingService(s.embedding_dim)
        elif s.embedding_provider == "sentence-transformers":
            _service = SentenceTransformerEmbeddingService(s.embedding_model, s.embedding_dim)
        else:
            raise RuntimeError(f"Unknown EMBEDDING_PROVIDER={s.embedding_provider!r}")
    return _service


def set_embedding_service(service: EmbeddingService | None) -> None:
    """Test hook."""
    global _service
    _service = service
