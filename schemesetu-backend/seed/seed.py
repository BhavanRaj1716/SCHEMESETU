"""Seed the database: verified NSFDC schemes (via the ingestion layer) + clearly-labelled DEMO partners.

Usage:  python -m seed.seed            (idempotent; safe to re-run)
        python -m seed.seed --no-partners
"""
import argparse

from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.db.models import ChannelPartner
from app.ingestion.nsfdc.loader import NsfdcIngestor
from app.services.embedding_service import get_embedding_service
from app.ingestion.nsfdc.verified_partners import VERIFIED_PARTNERS
from seed.demo_partners import PARTNERS


def seed_partners(db: Session) -> dict:
    """Loads REAL verified partners (TAHDCO + the 2020-evaluation-report PSB record for Tamil
    Nadu) first, then clearly-labelled DEMO branch-level records that fill out the map/list UI
    where no official geocoded directory exists. See app/ingestion/nsfdc/verified_partners.py.
    """
    verified = demo = 0
    for p in VERIFIED_PARTNERS:
        row = db.get(ChannelPartner, p["id"]) or ChannelPartner(id=p["id"])
        for k, v in p.items():
            setattr(row, k, v)
        db.add(row)
        verified += 1
    for p in PARTNERS:
        row = db.get(ChannelPartner, p["id"]) or ChannelPartner(id=p["id"])
        for k, v in p.items():
            setattr(row, k, v)
        db.add(row)
        demo += 1
    db.commit()
    return {"verified": verified, "demo": demo}


def run(db: Session, with_partners: bool = True, embedder=None) -> dict:
    summary = NsfdcIngestor(embedder or get_embedding_service()).run(db)
    if with_partners:
        summary["partners"] = seed_partners(db)
    return summary


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--no-partners", action="store_true")
    args = ap.parse_args()
    with SessionLocal() as session:
        print(run(session, with_partners=not args.no_partners))
