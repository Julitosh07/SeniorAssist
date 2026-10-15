from fastapi import APIRouter, HTTPException, status
from backend.app.schemas.auth import DeviceAuthRequest, TokenResponse
from backend.app.security.jwt_handler import create_access_token
from backend.app.config import JWT_EXPIRATION_DAYS

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/device", response_model=TokenResponse)
async def authenticate_device(req: DeviceAuthRequest):
    """
    Autenticación transparente por identificador único de dispositivo.
    El adulto mayor NO tiene que introducir usuario ni contraseña.
    """
    if not req.device_id or len(req.device_id.strip()) < 4:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Identificador de dispositivo no válido"
        )

    token = create_access_token(req.device_id.strip())

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_days=JWT_EXPIRATION_DAYS,
        device_id=req.device_id.strip()
    )
