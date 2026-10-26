"""
========================================================================================
SENIORASSIST - MICROSERVICIO 1: PROCESAMIENTO DE VOZ Y LENGUAJE NATURAL (NLU)
Tipo de Software: Microservicio Independiente como Software Nativo (Sin Docker)
Puerto de Ejecución: 8001
Documentación Swagger: http://localhost:8001/docs

Cumplimiento estricto de las 3 Capas requeridas por la asignatura:
  1. EL VALIDADOR (Pydantic Schema para validación estricta de tipos de entrada)
  2. EL MICROSERVICIO (Clase con la lógica de negocio y procesamiento de lenguaje)
  3. EL ENDPOINT (Controlador HTTP REST expuesto al cliente)
========================================================================================
"""

from fastapi import FastAPI, status
from pydantic import BaseModel, Field
import uvicorn
import re

app = FastAPI(
    title="Microservicio 1: NLU & Procesamiento de Voz",
    description="Microservicio desacoplado para inferencia de voz y extracción de intenciones de adultos mayores.",
    version="1.0.0"
)

# ======================================================================================
# 1. EL VALIDADOR (Pydantic Request & Response Schemas)
# ======================================================================================
class VoiceValidationRequest(BaseModel):
    """
    Capa 1: Validador de entrada.
    Asegura que el texto transcrito cumpla con restricciones de tamaño y tipo.
    """
    text: str = Field(..., min_length=2, max_length=500, description="Texto transcrito de voz del adulto mayor")
    device_id: str = Field(default="device-senior-001", description="Identificador único del dispositivo emisor")

class VoiceValidationResponse(BaseModel):
    """
    Capa 1: Validador de salida estructurada.
    """
    action: str = Field(..., description="Acción normalizada de la lista blanca")
    confidence: float = Field(..., ge=0.0, le=1.0, description="Nivel de confianza de la inferencia")
    parameters: dict = Field(default_factory=dict, description="Entidades y parámetros extraídos")
    feedback_audio_text: str = Field(..., description="Respuesta auditiva sintetizada para el abuelo")
    service_source: str = Field(default="Microservicio_1_Voz_Puerto_8001", description="Origen del microservicio")


# ======================================================================================
# 2. EL MICROSERVICIO (Lógica de Negocio y Clasificación)
# ======================================================================================
class VoiceNLUMicroservice:
    """
    Capa 2: Lógica pura de negocio del microservicio.
    Desacoplada del protocolo HTTP; procesa texto y clasifica bajo lista blanca estricta.
    """
    ALLOWED_ACTIONS = [
        "CALL_CONTACT", "SEND_WHATSAPP", "CREATE_ALARM", 
        "TRIGGER_SOS", "TURN_FLASHLIGHT_ON", "TURN_FLASHLIGHT_OFF",
        "OPEN_MAGNIFIER", "PLAY_RADIO", "STOP_RADIO"
    ]

    @classmethod
    def execute_intent_inference(cls, text: str) -> dict:
        clean_text = text.lower().strip()

        # 1. Intención: Llamar a un contacto
        match_call = re.search(r"(?:llama(?:le)?\s+a|llamar\s+a)\s+([a-záéíóúñ\s]+)", clean_text)
        if match_call:
            contact = match_call.group(1).replace("mi ", "").strip().title()
            return {
                "action": "CALL_CONTACT",
                "confidence": 0.98,
                "parameters": {"contact": contact},
                "feedback_audio_text": f"Llamando a {contact}",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 2. Intención: Enviar WhatsApp
        match_wa = re.search(r"(?:manda|env[ií]a|escr[ií]be)(?:le)?\s+(?:un\s+)?mensaje\s+a\s+([a-záéíóúñ\s]+?)(?:\s+(?:que|diciendo)\s+(.*))?$", clean_text)
        if match_wa:
            contact = match_wa.group(1).replace("mi ", "").strip().title()
            msg = match_wa.group(2) if match_wa.group(2) else "Hola"
            return {
                "action": "SEND_WHATSAPP",
                "confidence": 0.95,
                "parameters": {"contact": contact, "message": msg},
                "feedback_audio_text": f"Abriendo WhatsApp para escribirle a {contact}",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 3. Intención: Emergencia SOS
        if any(w in clean_text for w in ["auxilio", "ayuda", "emergencia", "socorro", "me caí"]):
            return {
                "action": "TRIGGER_SOS",
                "confidence": 1.0,
                "parameters": {"emergency": True, "priority": "CRITICAL"},
                "feedback_audio_text": "Alerta SOS activada. Llamando a tu contacto de emergencia y enviando ubicación.",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 4. Intención: Alarma de medicamento
        if any(w in clean_text for w in ["alarma", "recuérdame", "pastilla", "medicamento"]):
            return {
                "action": "CREATE_ALARM",
                "confidence": 0.93,
                "parameters": {"description": clean_text},
                "feedback_audio_text": "Alarma de medicina programada correctamente.",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 5. Intención: Linterna
        if "linterna" in clean_text:
            is_on = "apaga" not in clean_text
            return {
                "action": "TURN_FLASHLIGHT_ON" if is_on else "TURN_FLASHLIGHT_OFF",
                "confidence": 0.99,
                "parameters": {"state": is_on},
                "feedback_audio_text": "Linterna encendida" if is_on else "Linterna apagada",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 6. Intención: Lupa
        if "lupa" in clean_text:
            return {
                "action": "OPEN_MAGNIFIER",
                "confidence": 0.96,
                "parameters": {},
                "feedback_audio_text": "Abriendo la lupa digital de aumento",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        # 7. Intención: Radio
        if "radio" in clean_text:
            return {
                "action": "PLAY_RADIO",
                "confidence": 0.94,
                "parameters": {"station": "Radio Nacional de Colombia"},
                "feedback_audio_text": "Sintonizando la radio en vivo",
                "service_source": "Microservicio_1_Voz_Puerto_8001"
            }

        return {
            "action": "UNKNOWN",
            "confidence": 0.25,
            "parameters": {},
            "feedback_audio_text": "No comprendí la orden. Por favor intenta de nuevo.",
            "service_source": "Microservicio_1_Voz_Puerto_8001"
        }


# ======================================================================================
# 3. EL ENDPOINT (Controlador REST HTTP)
# ======================================================================================
@app.post(
    "/api/v1/voice/process-intent", 
    response_model=VoiceValidationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Endpoint Principal"]
)
async def process_voice_intent_endpoint(request: VoiceValidationRequest):
    """
    Capa 3: Endpoint REST.
    Recibe la petición validada, ejecuta el microservicio y retorna la respuesta.
    """
    result = VoiceNLUMicroservice.execute_intent_inference(request.text)
    return result

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "microservice": "Microservicio 1 - NLU y Voz",
        "port": 8001,
        "runtime": "Python 3.10 Nativo (Sin Docker)"
    }


# ======================================================================================
# EJECUCIÓN COMO SOFTWARE AUTÓNOMO EN EL PUERTO 8001
# ======================================================================================
if __name__ == "__main__":
    print("==========================================================================")
    print("🚀 INICIANDO MICROSERVICIO 1: NLU Y PROCESAMIENTO DE VOZ")
    print("👉 Puerto: 8001 | Swagger Docs: http://localhost:8001/docs")
    print("👉 Capas: 1. Validador (Pydantic) | 2. Lógica (NLU) | 3. Endpoint (REST)")
    print("==========================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8001)
