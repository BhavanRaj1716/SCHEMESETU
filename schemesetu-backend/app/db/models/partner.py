from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import JSON, CheckConstraint, Date, DateTime, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base

# Categories described on the official NSFDC channel-finance FAQ/pages.
PARTNER_TYPES = ("SCA", "CA", "PSB", "RRB", "NBFC-MFI", "Cooperative Bank", "Cooperative Society", "Small Finance Bank", "Other")


class ChannelPartner(Base):
    __tablename__ = "channel_partners"
    __table_args__ = (CheckConstraint("data_status IN ('LIVE','VERIFIED','DEMO')", name="ck_partners_data_status"),)

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    state: Mapped[str | None] = mapped_column(String(64), index=True)
    district: Mapped[str | None] = mapped_column(String(64), index=True)
    address: Mapped[str | None] = mapped_column(Text)
    latitude: Mapped[float | None] = mapped_column(Float)
    longitude: Mapped[float | None] = mapped_column(Float)
    supported_schemes: Mapped[list | None] = mapped_column(JSON)  # list of scheme ids
    official_source: Mapped[str | None] = mapped_column(String(512))
    source_document: Mapped[str | None] = mapped_column(String(255))
    last_verified_at: Mapped[date | None] = mapped_column(Date)
    data_status: Mapped[str] = mapped_column(String(16), nullable=False, default="DEMO")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
