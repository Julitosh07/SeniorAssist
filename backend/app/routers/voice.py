from fastapi import APIRouter, Header, HTTPException, status
from typing import Optional
from backend.app.schemas.intent import IntentRequest, IntentResponse
from backend.app.services.nlu_service import NLUService
from backend.app.security.jwt_handler import verify_token

router = APIRouter(tags=["Voice & AI"])

def authenticate_jwt_header(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        # Permitimos fallback académico si no se envía cabecera
        return "anonymous_device"
    
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Formato de autorización inválido"
        )

    token = parts[1]
    device_id = verify_token(token)
    if not device_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de sesión expirado o inválido"
        )
    return device_id

@router.post("/ai/intent", response_model=IntentResponse)
async def extract_intent(req: IntentRequest, authorization: Optional[str] = Header(None)):
    """
    Procesa un comando de lenguaje natural y extrae la intención estructurada
    verificando la lista blanca estricta de acciones permitidas.
    """
    authenticate_jwt_header(authorization)

    intent_response = NLUService.process_text_intent(req.text)
    return intent_response

@router.post("/voice/process", response_model=IntentResponse)
async def process_voice(req: IntentRequest, authorization: Optional[str] = Header(None)):
    """
    Endpoint alternativo especificado en IEEE 830 para procesamiento de voz.
    """
    return await extract_intent(req, authorization)
