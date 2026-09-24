from fastapi import APIRouter

from app.api.errors import AppError
from app.schemas.calculator import EmiRequest, EmiResponse
from app.schemas.common import ErrorResponse
from app.services.calculator_service import compute_emi

router = APIRouter(prefix="/api/calculator", tags=["Calculator"])


@router.post("/emi", response_model=EmiResponse, responses={422: {"model": ErrorResponse}}, summary="Illustrative EMI calculation")
def emi(payload: EmiRequest):
    try:
        return compute_emi(payload)
    except ValueError as exc:
        raise AppError("INVALID_REQUEST", str(exc), 422) from exc
