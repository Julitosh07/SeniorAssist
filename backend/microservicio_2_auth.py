"""
========================================================================================
SENIORASSIST - MICROSERVICIO 2: AUTENTICACIÓN Y SEGURIDAD JWA (ZERO-LOGIN)
Tipo de Software: Microservicio Independiente como Software Nativo (Sin Docker)
Puerto de Ejecución: 8002
Documentación Swagger: http://localhost:8002/docs

Cumplimiento estricto de las 3 Capas requeridas por la asignatura:
  1. EL VALIDADOR (Pydantic Schema para validación estricta de tipos de entrada)
  2. EL MICROSERVICIO (Clase con la lógica criptográfica JWA RFC 7518 - HS256)
  3. EL ENDPOINT (Controlador HTTP REST expuesto al cliente)
========================================================================================
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
import uvicorn
import time
import hmac
import hashlib
import base64
import json

app = FastAPI(
    title="Microservicio 2: Seguridad y Autenticación Zero-Login",
    description="Microservicio desacoplado para emisión y validación de tokens JWT por hardware.",
    version="1.0.0"
)

# ======================================================================================
# 1. EL VALIDADOR (Pydantic Request & Response Schemas)
# ======================================================================================
class DeviceAuthValidationRequest(BaseModel):
    """
    Capa 1: Validador de entrada.
    Asegura que el identificador de hardware del teléfono sea válido.
    """
    device_id: str = Field(..., min_length=4, max_length=120, description="Identificador único del hardware móvil (UUID)")
    app_version: str = Field(default="1.0.0", description="Versión del cliente SeniorAssist")
    platform: str = Field(default="android", description="Plataforma del sistema operativo móvil")

class TokenValidationResponse(BaseModel):
    """
    Capa 1: Validador de salida estructurada.
    """
    access_token: str = Field(..., description="Token JWT firmado criptográficamente con HS256")
    token_type: str = Field(default="bearer", description="Tipo de token estándar RFC 6750")
    algorithm: str = Field(default="HS256", description="Algoritmo de firma criptográfica JWA")
    expires_in_days: int = Field(default=30, description="Vigencia transparente del token para el adulto mayor")
    device_id: str = Field(..., description="Dispositivo autenticado")
    service_source: str = Field(default="Microservicio_2_Auth_Puerto_8002", description="Origen del microservicio")


# ======================================================================================
# 2. EL MICROSERVICIO (Lógica de Negocio Criptográfica JWA)
# ======================================================================================
class DeviceAuthMicroservice:
    """
    Capa 2: Lógica pura del microservicio de autenticación.
    Implementa el estándar JWA (RFC 7518) para firma HMAC-SHA256 sin dependencia de BD externa.
    """
    SECRET_KEY = "senior_assist_super_secure_academic_key_2026_uts"
    ALGORITHM = "HS256"

    @classmethod
    def generate_signed_jwt(cls, device_id: str) -> str:
        now = int(time.time())
        exp = now + (30 * 86400) # 30 días de vigencia transparente sin contraseñas
        
        # Header (JWA: HS256)
        header = {"alg": cls.ALGORITHM, "typ": "JWT"}
        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        
        # Payload (Claims del adulto mayor)
        payload = {
            "sub": device_id,
            "iat": now,
            "exp": exp,
            "scope": "senior_assist_verified_device",
            "issuer": "SeniorAssist-Auth-Microservice-8002"
        }
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
        
        # Firma Criptográfica HMAC-SHA256
        signature_base = f"{header_b64}.{payload_b64}".encode()
        raw_signature = hmac.new(cls.SECRET_KEY.encode(), signature_base, hashlib.sha256).digest()
        signature_b64 = base64.urlsafe_b64encode(raw_signature).decode().rstrip("=")
        
        return f"{header_b64}.{payload_b64}.{signature_b64}"

    @classmethod
    def verify_token_integrity(cls, token: str) -> bool:
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return False
            header_b64, payload_b64, signature_b64 = parts
            signature_base = f"{header_b64}.{payload_b64}".encode()
            expected_sig = hmac.new(cls.SECRET_KEY.encode(), signature_base, hashlib.sha256).digest()
            expected_b64 = base64.urlsafe_b64encode(expected_sig).decode().rstrip("=")
            return hmac.compare_digest(signature_b64, expected_b64)
        except Exception:
            return False


# ======================================================================================
# 3. EL ENDPOINT (Controlador REST HTTP)
# ======================================================================================
@app.post(
    "/api/v1/auth/device-session",
    response_model=TokenValidationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Endpoint Principal"]
)
async def create_device_session_endpoint(request: DeviceAuthValidationRequest):
    """
    Capa 3: Endpoint REST.
    Recibe el identificador de hardware validado, ejecuta la lógica del microservicio
    y retorna el token JWT firmado de forma transparente (Zero-Login).
    """
    token = DeviceAuthMicroservice.generate_signed_jwt(request.device_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "algorithm": "HS256",
        "expires_in_days": 30,
        "device_id": request.device_id,
        "service_source": "Microservicio_2_Auth_Puerto_8002"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "microservice": "Microservicio 2 - Seguridad y Autenticación JWA",
        "port": 8002,
        "runtime": "Python 3.10 Nativo (Sin Docker)"
    }


# ======================================================================================
# EJECUCIÓN COMO SOFTWARE AUTÓNOMO EN EL PUERTO 8002
# ======================================================================================
if __name__ == "__main__":
    print("==========================================================================")
    print("🚀 INICIANDO MICROSERVICIO 2: AUTENTICACIÓN Y SEGURIDAD JWA (ZERO-LOGIN)")
    print("👉 Puerto: 8002 | Swagger Docs: http://localhost:8002/docs")
    print("👉 Capas: 1. Validador (Pydantic) | 2. Lógica (JWA) | 3. Endpoint (REST)")
    print("==========================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8002)
