"""
========================================================================================
SENIORASSIST - DEMOSTRACIÓN DE MICROSERVICIOS COMO SOFTWARE (SIN DOCKER)
Cumplimiento estricto del requerimiento del profesor para la evaluación práctica.
Cada microservicio contiene explícitamente sus 3 capas:
  1. El Validador (Esquema Pydantic para validar entradas)
  2. El Microservicio (Lógica de negocio y procesamiento)
  3. El Endpoint (Ruta HTTP REST consumible)
========================================================================================
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import uvicorn
import re
import time
import hmac
import hashlib
import base64
import json

app = FastAPI(
    title="SeniorAssist - Microservicios Nativos como Software (Sin Docker)",
    description="Demostración técnica de 2 microservicios independientes ejecutados en Python nativo.",
    version="1.0.0"
)

# ======================================================================================
# MICROSERVICIO 1: PROCESAMIENTO DE LENGUAJE NATURAL Y VOZ (NLU / INTENT ENGINE)
# ======================================================================================

# CAPA 1: EL VALIDADOR (Pydantic Schema)
class IntentValidationRequest(BaseModel):
    text: str = Field(..., min_length=2, max_length=500, description="Texto transcrito de voz del adulto mayor")
    device_id: str = Field(default="demo-device", description="Identificador único del dispositivo")

class IntentActionResponse(BaseModel):
    action: str
    confidence: float
    parameters: dict
    feedback_audio_text: str

# CAPA 2: EL MICROSERVICIO (Lógica de Negocio y Extracción de Intenciones)
class NLUMicroservice:
    ALLOWED_ACTIONS = [
        "CALL_CONTACT", "SEND_WHATSAPP", "CREATE_ALARM", 
        "TRIGGER_SOS", "TURN_FLASHLIGHT_ON", "TURN_FLASHLIGHT_OFF",
        "OPEN_MAGNIFIER", "PLAY_RADIO", "STOP_RADIO", "OPEN_LESSON"
    ]

    @classmethod
    def process_voice_intent(cls, text: str) -> dict:
        clean_text = text.lower().strip()

        # Intención de llamada
        match_call = re.search(r"(?:llama(?:le)?\s+a|llamar\s+a)\s+([a-záéíóúñ\s]+)", clean_text)
        if match_call:
            contact = match_call.group(1).replace("mi ", "").strip()
            return {
                "action": "CALL_CONTACT",
                "confidence": 0.98,
                "parameters": {"contact": contact},
                "feedback_audio_text": f"Llamando a {contact}"
            }

        # Intención de WhatsApp
        match_wa = re.search(r"(?:manda|env[ií]a|escr[ií]be)(?:le)?\s+(?:un\s+)?mensaje\s+a\s+([a-záéíóúñ\s]+?)(?:\s+(?:que|diciendo)\s+(.*))?$", clean_text)
        if match_wa:
            contact = match_wa.group(1).replace("mi ", "").strip()
            msg = match_wa.group(2) if match_wa.group(2) else "Hola"
            return {
                "action": "SEND_WHATSAPP",
                "confidence": 0.95,
                "parameters": {"contact": contact, "message": msg},
                "feedback_audio_text": f"Abriendo WhatsApp para escribirle a {contact}"
            }

        # Intención de alarma
        if "alarma" in clean_text or "recuérdame" in clean_text or "pastilla" in clean_text:
            return {
                "action": "CREATE_ALARM",
                "confidence": 0.92,
                "parameters": {"description": clean_text},
                "feedback_audio_text": "Alarma de medicamento programada correctamente"
            }

        # Intención de emergencia SOS
        if "auxilio" in clean_text or "ayuda" in clean_text or "emergencia" in clean_text:
            return {
                "action": "TRIGGER_SOS",
                "confidence": 1.0,
                "parameters": {"emergency": True},
                "feedback_audio_text": "Alerta SOS activada. Notificando a tus contactos de emergencia."
            }

        # Radio
        if "radio" in clean_text:
            return {
                "action": "PLAY_RADIO",
                "confidence": 0.94,
                "parameters": {"station": "Radio Nacional"},
                "feedback_audio_text": "Sintonizando la radio"
            }

        # Linterna
        if "linterna" in clean_text:
            is_on = "apaga" not in clean_text
            return {
                "action": "TURN_FLASHLIGHT_ON" if is_on else "TURN_FLASHLIGHT_OFF",
                "confidence": 0.99,
                "parameters": {"state": is_on},
                "feedback_audio_text": "Linterna encendida" if is_on else "Linterna apagada"
            }

        # Lupa
        if "lupa" in clean_text:
            return {
                "action": "OPEN_MAGNIFIER",
                "confidence": 0.96,
                "parameters": {},
                "feedback_audio_text": "Abriendo la lupa digital"
            }

        return {
            "action": "UNKNOWN",
            "confidence": 0.3,
            "parameters": {},
            "feedback_audio_text": "No comprendí esa instrucción. Intenta de nuevo."
        }

# CAPA 3: EL ENDPOINT (Controlador REST)
@app.post("/api/v1/voice/process-intent", response_model=IntentActionResponse, tags=["Microservicio 1: Voz/NLU"])
async def voice_intent_endpoint(request: IntentValidationRequest):
    """
    Endpoint del Microservicio 1: Recibe el texto transcrito de voz,
    lo valida con Pydantic y extrae la intención estructurada.
    """
    result = NLUMicroservice.process_voice_intent(request.text)
    return result


# ======================================================================================
# MICROSERVICIO 2: AUTENTICACIÓN TRANSPARENTE Y SEGURIDAD JWA (ZERO-LOGIN)
# ======================================================================================

# CAPA 1: EL VALIDADOR (Pydantic Schema)
class DeviceAuthValidationRequest(BaseModel):
    device_id: str = Field(..., min_length=4, max_length=120, description="Identificador único de hardware del móvil")
    app_version: str = Field(default="1.0.0", description="Versión del cliente SeniorAssist")
    platform: str = Field(default="android", description="Sistema operativo móvil")

class TokenValidationResponse(BaseModel):
    access_token: str
    token_type: str
    algorithm: str
    expires_in_days: int
    device_id: str

# CAPA 2: EL MICROSERVICIO (Lógica Criptográfica JWA - HS256)
class DeviceAuthMicroservice:
    SECRET_KEY = "senior_assist_super_secure_academic_key_2026_uts"
    ALGORITHM = "HS256"

    @classmethod
    def generate_signed_jwt(cls, device_id: str) -> str:
        now = int(time.time())
        exp = now + (30 * 86400) # 30 días de vigencia transparente
        
        # Header (JWA: HS256)
        header = {"alg": cls.ALGORITHM, "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        
        # Payload (Claims del dispositivo)
        payload = {
            "sub": device_id,
            "iat": now,
            "exp": exp,
            "scope": "senior_assist_verified_device"
        }
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        
        # Firma Criptográfica HMAC-SHA256
        message = f"{header_b64}.{payload_b64}".encode()
        signature = hmac.new(cls.SECRET_KEY.encode(), message, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        
        return f"{header_b64}.{payload_b64}.{signature_b64}"

    @classmethod
    def verify_jwt_signature(cls, token: str) -> bool:
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return False
            header_b64, payload_b64, signature_b64 = parts
            message = f"{header_b64}.{payload_b64}".encode()
            expected_sig = hmac.new(cls.SECRET_KEY.encode(), message, hashlib.sha256).digest()
            expected_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            return hmac.compare_digest(signature_b64, expected_b64)
        except Exception:
            return False

# CAPA 3: EL ENDPOINT (Controlador REST)
@app.post("/api/v1/auth/device-session", response_model=TokenValidationResponse, tags=["Microservicio 2: Seguridad JWA"])
async def device_session_endpoint(request: DeviceAuthValidationRequest):
    """
    Endpoint del Microservicio 2: Genera un token JWT firmado criptográficamente
    con algoritmo JWA HS256 de forma transparente para el adulto mayor.
    """
    token = DeviceAuthMicroservice.generate_signed_jwt(request.device_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "algorithm": "HS256",
        "expires_in_days": 30,
        "device_id": request.device_id
    }

# ======================================================================================
# INICIO Y EJECUCIÓN COMO SOFTWARE NATIVO
# ======================================================================================
if __name__ == "__main__":
    print("=========================================================================")
    print("🚀 Levantando Microservicios de SeniorAssist como Software Nativo...")
    print("👉 Accede a la documentación interactiva en: http://localhost:8000/docs")
    print("=========================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8000)
