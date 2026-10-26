"""
========================================================================================
SENIORASSIST - MICROSERVICIO 3: TUTOR DE APRENDIZAJE Y ADAPTACIÓN PEDAGÓGICA
Tipo de Software: Microservicio Independiente como Software Nativo (Sin Docker)
Puerto de Ejecución: 8003
Documentación Swagger: http://localhost:8003/docs

Cumplimiento estricto de las 3 Capas requeridas por la asignatura:
  1. EL VALIDADOR (Pydantic Schema para validación estricta de métricas de aprendizaje)
  2. EL MICROSERVICIO (Clase con la lógica heurística de adaptación pedagógica sensible)
  3. EL ENDPOINT (Controlador HTTP REST expuesto al cliente)
========================================================================================
"""

from fastapi import FastAPI, HTTPException, status
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn

app = FastAPI(
    title="Microservicio 3: Tutor de Aprendizaje y Pedagogía IA",
    description="Microservicio desacoplado para evaluación del ritmo cognitivo del adulto mayor y catálogo de lecciones.",
    version="1.0.0"
)

# ======================================================================================
# 1. EL VALIDADOR (Pydantic Request & Response Schemas)
# ======================================================================================
class PedagogyEvaluationRequest(BaseModel):
    """
    Capa 1: Validador de entrada.
    Evalúa el desempeño del adulto mayor en los simuladores interactivos.
    """
    lesson_id: str = Field(..., min_length=3, description="Identificador de la lección (ej: lesson-wa)")
    errors_count: int = Field(default=0, ge=0, description="Número de toques erróneos o fallos")
    hints_requested: int = Field(default=0, ge=0, description="Pistas solicitadas por el abuelo")
    total_time_seconds: float = Field(..., gt=0.0, description="Tiempo invertido en completar el paso")
    device_id: str = Field(default="device-senior-001", description="Dispositivo del adulto mayor")

class PedagogyEvaluationResponse(BaseModel):
    """
    Capa 1: Validador de salida estructurada con adaptación dinámica.
    """
    difficulty_recommended: str = Field(..., description="Nivel adaptado: easy, normal, challenging")
    speech_rate: float = Field(..., description="Velocidad recomendada para el sintetizador de voz (TTS)")
    show_instant_hints: bool = Field(..., description="Indica si se deben activar pistas visuales inmediatas")
    feedback_message: str = Field(..., description="Mensaje auditivo de refuerzo positivo")
    encouragement_text: str = Field(..., description="Mensaje empático de motivación")
    service_source: str = Field(default="Microservicio_3_Learning_Puerto_8003", description="Origen del microservicio")


# ======================================================================================
# 2. EL MICROSERVICIO (Lógica de Negocio y Adaptación Cognitiva)
# ======================================================================================
class PedagogicalLearningMicroservice:
    """
    Capa 2: Lógica pura del microservicio de aprendizaje.
    Ajusta dinámicamente la velocidad de habla y dificultad según el nivel de frustración o destreza.
    """
    LESSONS_DB = [
        {"id": "lesson-wa", "title": "Aprender WhatsApp Familiar", "steps": 5, "category": "Comunicación"},
        {"id": "lesson-cam", "title": "Cómo Usar la Cámara y Fotos", "steps": 4, "category": "Recuerdos"},
        {"id": "lesson-call", "title": "Cómo Recibir Llamadas y Usar Altavoz", "steps": 4, "category": "Seguridad"},
        {"id": "lesson-audio", "title": "Escuchar y Pausar Audios", "steps": 3, "category": "Mensajería"}
    ]

    @classmethod
    def evaluate_performance(cls, req: PedagogyEvaluationRequest) -> dict:
        # Heurística sensible para adultos mayores:
        # Si tiene más de 2 errores o tarda más de 45 segundos, se baja la dificultad y se habla más pausado.
        if req.errors_count >= 2 or req.hints_requested >= 2 or req.total_time_seconds > 45.0:
            return {
                "difficulty_recommended": "easy",
                "speech_rate": 0.75, # Voz pausada y articulada
                "show_instant_hints": True,
                "feedback_message": "Vamos con calma. Tómate todo el tiempo que necesites, lo estás haciendo muy bien.",
                "encouragement_text": "No te preocupes por los errores, cada intento te ayuda a aprender. Te guiaremos paso a paso.",
                "service_source": "Microservicio_3_Learning_Puerto_8003"
            }
        elif req.errors_count == 0 and req.hints_requested == 0 and req.total_time_seconds < 25.0:
            return {
                "difficulty_recommended": "challenging",
                "speech_rate": 0.90, # Velocidad ágil
                "show_instant_hints": False,
                "feedback_message": "¡Excelente destreza! Dominas esta función con mucha seguridad y rapidez.",
                "encouragement_text": "¡Felicitaciones por tu autonomía y entusiasmo digital!",
                "service_source": "Microservicio_3_Learning_Puerto_8003"
            }
        else:
            return {
                "difficulty_recommended": "normal",
                "speech_rate": 0.82,
                "show_instant_hints": False,
                "feedback_message": "¡Muy buen avance! Cada paso te acerca a comunicarte con más confianza.",
                "encouragement_text": "Continúa practicando a tu propio ritmo con tranquilidad.",
                "service_source": "Microservicio_3_Learning_Puerto_8003"
            }

    @classmethod
    def get_lessons_catalog(cls) -> list:
        return cls.LESSONS_DB


# ======================================================================================
# 3. EL ENDPOINT (Controlador REST HTTP)
# ======================================================================================
@app.post(
    "/api/v1/learning/evaluate-performance",
    response_model=PedagogyEvaluationResponse,
    status_code=status.HTTP_200_OK,
    tags=["Endpoint Principal"]
)
async def evaluate_performance_endpoint(request: PedagogyEvaluationRequest):
    """
    Capa 3: Endpoint REST.
    Recibe métricas cognitivas, ejecuta el motor pedagógico y adapta la interfaz por voz.
    """
    result = PedagogicalLearningMicroservice.evaluate_performance(request)
    return result

@app.get("/api/v1/learning/catalog", tags=["Catálogo"])
async def get_catalog_endpoint():
    """
    Retorna el listado de módulos pedagógicos interactivos disponibles.
    """
    return {
        "total_modules": len(PedagogicalLearningMicroservice.get_lessons_catalog()),
        "modules": PedagogicalLearningMicroservice.get_lessons_catalog(),
        "service_source": "Microservicio_3_Learning_Puerto_8003"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "HEALTHY",
        "microservice": "Microservicio 3 - Tutor de Aprendizaje y Pedagogía",
        "port": 8003,
        "runtime": "Python 3.10 Nativo (Sin Docker)"
    }


# ======================================================================================
# EJECUCIÓN COMO SOFTWARE AUTÓNOMO EN EL PUERTO 8003
# ======================================================================================
if __name__ == "__main__":
    print("==========================================================================")
    print("🚀 INICIANDO MICROSERVICIO 3: TUTOR DE APRENDIZAJE Y PEDAGOGÍA IA")
    print("👉 Puerto: 8003 | Swagger Docs: http://localhost:8003/docs")
    print("👉 Capas: 1. Validador (Pydantic) | 2. Lógica (Pedagogía) | 3. Endpoint (REST)")
    print("==========================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8003)
