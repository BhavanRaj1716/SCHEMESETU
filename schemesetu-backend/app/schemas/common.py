from datetime import date
from enum import Enum

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

UNAVAILABLE_MESSAGE = "Information currently unavailable — please verify with the official source."


class CamelModel(BaseModel):
    """All API JSON is camelCase (matches the frontend contract); Python code stays snake_case."""

    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, from_attributes=True)


class DataStatus(str, Enum):
    LIVE = "LIVE"
    VERIFIED = "VERIFIED"
    DEMO = "DEMO"


class OfficialSource(CamelModel):
    organization: str | None = None
    url: str | None = None
    document: str | None = None
    last_verified: date | None = None
    data_updated: date | None = None
    data_status: DataStatus


class ErrorBody(CamelModel):
    code: str
    message: str
    details: dict = {}


class ErrorResponse(CamelModel):
    error: ErrorBody
