@echo off
title Microservicio 4: Observabilidad y Metricas APM (Puerto 8004)
color 0C
cd /d "%~dp0\.."
echo =========================================================================
echo   INICIANDO MICROSERVICIO 4: OBSERVABILIDAD Y PROMETHEUS (PUERTO 8004)
echo   Capas: 1. Validador (Pydantic) ^| 2. Logica (APM) ^| 3. Endpoint (REST)
echo =========================================================================
python backend/microservicio_4_monitoring.py
pause
