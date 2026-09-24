"""Print semantic similarities for sample queries so you can tune SEMANTIC_MIN_SIMILARITY for your embedding model.
Usage: python -m scripts.check_retrieval "dairy business" "I want to study MBBS"
"""
import sys

from app.db.database import SessionLocal
from app.services.embedding_service import get_embedding_service
from app.services.semantic_search import SemanticSearch
from app.utils.text import normalize_text

queries = sys.argv[1:] or ["I need ₹3 lakh to start a dairy business", "college fees for engineering", "பால் தொழில் தொடங்க கடன்"]
emb = get_embedding_service()
with SessionLocal() as db:
    for q in queries:
        print(f"\n{q}")
        for c in SemanticSearch(db).search(emb.embed_one(normalize_text(q)), 10, -1.0):
            print(f"  {c.similarity:7.4f}  {c.scheme.name}")
