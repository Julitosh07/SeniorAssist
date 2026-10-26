"""
========================================================================================
SENIORASSIST - MICROSERVICIO 4: OBSERVABILIDAD, SALUD Y MÉTRICAS APM (PROMETHEUS)
Tipo de Software: Microservicio Independiente como Software Nativo (Sin Docker)
Puerto de Ejecución: 8004
Documentación Swagger: http://localhost:8004/docs

Cumplimiento estricto de las 3 Capas requeridas por la asignatura:
  1. EL VALIDADOR (Pydantic Schema para validación de telemetría y métricas)
  2. EL MICROSERVICIO (Clase de cálculo de series de tiempo y formato Prometheus)
  3. EL ENDPOINT (Controlador HTTP REST expuesto al cliente y Datadog)
========================================================================================
"""

from fastapi import FastAPI, HTTPException, status, Response
from pydantic import BaseModel, Field
import uvicorn
import time
import os
import sys

app = FastAPI(
    title="Microservicio 4: Observabilidad y Métricas APM",
    description="Microservicio desacoplado para telemetría continua, alertas de latencia y formato estándar Prometheus.",
    version="1.0.0"
)

# ======================================================================================
# 1. EL VALIDADOR (Pydantic Request & Response Schemas)
# ======================================================================================
class MetricIngestRequest(BaseModel):
    """
    Capa 1: Validador de entrada de telemetría.
    Recibe eventos de rendimiento desde el cliente móvil o servicios.
    """
    event_type: str = Field(..., min_length=3, description="Tipo de evento: voice_command, auth_attempt, sos_trigger")
    latency_ms: float = Field(..., ge=0.0, description="Tiempo de respuesta en milisegundos")
    success: bool = Field(default=True, description="Indica si la operación fue exitosa")
    device_id: str = Field(default="device-senior-001", description="Identificador del móvil")

class MetricIngestResponse(BaseModel):
    """
    Capa 1: Validador de confirmación de ingesta.
    """
    status: str = Field(..., description="Estado del registro: ACCEPTED")
    metric_id: str = Field(..., description="Identificador único del registro")
    timestamp: float = Field(..., description="Timestamp Epoch de la medición")
    p95_latency_ms: float = Field(..., description="Latencia percentil 95 computada")
    service_source: str = Field(default="Microservicio_4_Monitoring_Puerto_8004", description="Origen del microservicio")


# ======================================================================================
# 2. EL MICROSERVICIO (Lógica de Observabilidad y APM)
# ======================================================================================
class ObservabilityMicroservice:
    """
    Capa 2: Lógica pura de observabilidad.
    Calcula agregaciones de telemetría, monitorea latencias y genera texto compatible con Prometheus.
    """
    START_TIME = time.time()
    METRICS_STORE = {
        "total_requests": 0,
        "voice_events": 0,
        "auth_events": 0,
        "errors_count": 0,
        "latencies": [120.0, 145.0, 110.0, 135.0] # Seed académico
    }

    @classmethod
    def record_telemetry_event(cls, req: MetricIngestRequest) -> dict:
        cls.METRICS_STORE["total_requests"] += 1
        cls.METRICS_STORE["latencies"].append(req.latency_ms)
        
        if req.event_type == "voice_command":
            cls.METRICS_STORE["voice_events"] += 1
        elif req.event_type == "auth_attempt":
            cls.METRICS_STORE["auth_events"] += 1

        if not req.success:
            cls.METRICS_STORE["errors_count"] += 1

        # Cálculo de latencia percentil 95 (P95)
        sorted_latencies = sorted(cls.METRICS_STORE["latencies"])
        idx_p95 = int(len(sorted_latencies) * 0.95)
        p95_value = sorted_latencies[min(idx_p95, len(sorted_latencies) - 1)]

        return {
            "status": "ACCEPTED",
            "metric_id": f"metric-telemetry-{int(time.time() * 1000)}",
            "timestamp": time.time(),
            "p95_latency_ms": round(p95_value, 2),
            "service_source": "Microservicio_4_Monitoring_Puerto_8004"
        }

    @classmethod
    def generate_prometheus_payload(cls) -> str:
        uptime = int(time.time() - cls.START_TIME)
        lines = [
            "# HELP seniorassist_uptime_seconds Tiempo total activo del servicio",
            "# TYPE seniorassist_uptime_seconds counter",
            f"seniorassist_uptime_seconds {uptime}",
            "",
            "# HELP seniorassist_total_requests Total de peticiones procesadas",
            "# TYPE seniorassist_total_requests counter",
            f"seniorassist_total_requests {cls.METRICS_STORE['total_requests']}",
            "",
            "# HELP seniorassist_voice_commands_total Comandos de voz procesados",
            "# TYPE seniorassist_voice_commands_total counter",
            f"seniorassist_voice_commands_total {cls.METRICS_STORE['voice_events']}",
            "",
            "# HELP seniorassist_errors_total Total de errores registrados",
            "# TYPE seniorassist_errors_total counter",
            f"seniorassist_errors_total {cls.METRICS_STORE['errors_count']}"
        ]
        return "\n".join(lines)


# ======================================================================================
# 3. EL ENDPOINT (Controlador REST HTTP)
# ======================================================================================
@app.post(
    "/api/v1/monitoring/ingest",
    response_model=MetricIngestResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Endpoint Principal"]
)
async def ingest_metric_endpoint(request: MetricIngestRequest):
    """
    Capa 3: Endpoint REST de Ingesta.
    Valida la telemetría, actualiza las series de tiempo y devuelve métricas P95.
    """
    result = ObservabilityMicroservice.record_telemetry_event(request)
    return result

@app.get("/api/v1/monitoring/prometheus", tags=["Prometheus & Datadog"])
async def prometheus_metrics_endpoint():
    """
    Exporta métricas en formato estándar abierto Prometheus (RFC).
    """
    raw_content = ObservabilityMicroservice.generate_prometheus_payload()
    return Response(content=raw_content, media_type="text/plain; version=0.0.4")

@app.get("/health", tags=["Health"])
async def health_check():
    uptime = int(time.time() - ObservabilityMicroservice.START_TIME)
    return {
        "status": "HEALTHY",
        "microservice": "Microservicio 4 - Observabilidad y Métricas APM",
        "port": 8004,
        "uptime_seconds": uptime,
        "runtime": "Python 3.10 Nativo (Sin Docker)"
    }


# ======================================================================================
# EJECUCIÓN COMO SOFTWARE AUTÓNOMO EN EL PUERTO 8004
# ======================================================================================
if __name__ == "__main__":
    print("==========================================================================")
    print("🚀 INICIANDO MICROSERVICIO 4: OBSERVABILIDAD Y MÉTRICAS APM (PROMETHEUS)")
    print("👉 Puerto: 8004 | Swagger Docs: http://localhost:8004/docs")
    print("👉 Capas: 1. Validador (Pydantic) | 2. Lógica (APM) | 3. Endpoint (REST)")
    print("==========================================================================")
    uvicorn.run(app, host="0.0.0.0", port=8004)
