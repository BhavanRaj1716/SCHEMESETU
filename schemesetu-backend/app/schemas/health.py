from app.schemas.common import CamelModel


class HealthResponse(CamelModel):
    status: str
    database: str
    vector_search: str
    version: str
