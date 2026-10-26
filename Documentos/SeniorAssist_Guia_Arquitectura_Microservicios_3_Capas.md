# GUÍA MAESTRA DE ARQUITECTURA DE MICROSERVICIOS
## Implementación Tipo Software Desacoplado en 3 Capas (Validador, Microservicio y Endpoint)
**Proyecto:** SeniorAssist – Asistente Autónomo por Voz para Adultos Mayores  
**Materia:** Nuevas Tecnologías de Desarrollo – 6° Semestre UTS  
**Restricción Cumplida:** 100% Cero Docker (Procesos Nativos en Puertos 8001 a 8004 + PaaS Render)  

---

## 1. RESUMEN EJECUTIVO Y JUSTIFICACIÓN ARQUITECTÓNICA
En la ingeniería de software moderna, un microservicio no es un contenedor Docker, sino un patrón de diseño basado en la separación de responsabilidades y el desacoplamiento de software. Cada microservicio cuenta con sus 3 capas explícitas:
1. **El Validador (Pydantic Schema):** Valida tipos, longitudes y restricciones; rechaza datos corruptos con HTTP 422.
2. **El Microservicio (Lógica de Negocio):** Clase pura de Python con reglas de negocio desacopladas del framework web.
3. **El Endpoint (Controlador REST FastAPI):** Expone las rutas HTTP (@app.post, @app.get) y serializa respuestas en JSON.

---

## 2. UBICACIÓN DE ARCHIVOS EN EL REPOSITORIO

| Microservicio | Archivo del Script | Puerto | Lanzador Rápido (.bat) |
| :--- | :--- | :--- | :--- |
| **1. NLU y Voz** | `backend/microservicio_1_voz.py` | **8001** | `scripts/iniciar_microservicio_1.bat` |
| **2. Auth Zero-Login** | `backend/microservicio_2_auth.py` | **8002** | `scripts/iniciar_microservicio_2.bat` |
| **3. Tutor Pedagógico** | `backend/microservicio_3_learning.py` | **8003** | `scripts/iniciar_microservicio_3.bat` |
| **4. Observabilidad APM** | `backend/microservicio_4_monitoring.py` | **8004** | `scripts/iniciar_microservicio_4.bat` |
| **Suite de Pruebas** | `backend/probar_microservicios.py` | Cliente | `scripts/probar_microservicios.bat` |
| **Lanzador Maestro** | `scripts/iniciar_todos_microservicios.bat` | Todos | Abre las 4 terminales a la vez |
| **API Gateway Cloud** | `backend/app/main.py` | Producción | Unifica los 4 routers en Render |

---

## 3. DETALLE DE LAS 3 CAPAS EN CADA MICROSERVICIO

### 3.1. Microservicio 1: NLU y Voz (Puerto 8001)
- **Validador:** `VoiceValidationRequest` (valida texto mínimo 2 y máximo 500 caracteres).
- **Microservicio:** `VoiceNLUMicroservice` (clasifica 9 intenciones autorizadas como llamadas, SOS, radio, linterna).
- **Endpoint:** `@app.post('/api/v1/voice/process-intent')`.

### 3.2. Microservicio 2: Auth Zero-Login (Puerto 8002)
- **Validador:** `DeviceAuthValidationRequest` (valida UUID de hardware móvil).
- **Microservicio:** `DeviceAuthMicroservice` (criptografía JWA RFC 7518 con firma HMAC-SHA256).
- **Endpoint:** `@app.post('/api/v1/auth/device-session')`.

### 3.3. Microservicio 3: Tutor Pedagógico (Puerto 8003)
- **Validador:** `PedagogyEvaluationRequest` (errores, pistas y tiempo invertido).
- **Microservicio:** `PedagogicalLearningMicroservice` (heurística cognitiva sensible: adapta velocidad de voz a 0.75x).
- **Endpoint:** `@app.post('/api/v1/learning/evaluate-performance')` y catálogo.

### 3.4. Microservicio 4: Observabilidad APM (Puerto 8004)
- **Validador:** `MetricIngestRequest` (latencia en ms, eventos y estado).
- **Microservicio:** `ObservabilityMicroservice` (cálculo de percentil 95 y exportador Prometheus).
- **Endpoint:** `@app.post('/api/v1/monitoring/ingest')` y `@app.get('/api/v1/monitoring/prometheus')`.

---

## 4. GUÍA DE DEMOSTRACIÓN PRÁCTICA EN VIVO
1. Ejecutar `scripts/iniciar_todos_microservicios.bat` para levantar las 4 consolas.
2. Abrir en el navegador `http://localhost:8001/docs` a `http://localhost:8004/docs` para mostrar la documentación Swagger.
3. Ejecutar `scripts/probar_microservicios.bat` para evidenciar el consumo y la validación con rechazo HTTP 422.
4. Abrir `https://seniorassist.onrender.com/docs` para demostrar cómo opera el API Gateway en la nube.
