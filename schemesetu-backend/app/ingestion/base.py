"""Ingestion contract.

Ingestion is deliberately separate from the API: no request handler ever scrapes or updates government data.
Preferred order (spec §27): official APIs > official datasets > official documents > official pages > manually curated,
verified records. Anything that cannot be fetched automatically goes through the manual verification workflow
(edit the reviewed dataset, set lastVerified, run the seed/ingest command) - never fabricated.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class Provenance:
    organization: str
    url: str
    document: str
    last_verified: date
    data_updated: date | None = None
    data_status: str = "VERIFIED"


class SourceIngestor(ABC):
    name: str

    @abstractmethod
    def run(self, db) -> dict:
        """Load records into the database with provenance. Returns a summary dict."""
