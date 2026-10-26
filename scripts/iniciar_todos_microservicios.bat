@echo off
title Lanzador de los 4 Microservicios SeniorAssist
color 0F
cd /d "%~dp0\.."
echo =========================================================================
echo   LEVANTANDO LOS 4 MICROSERVICIOS INDEPENDIENTES (SIN DOCKER)
echo   Puerto 8001: NLU y Procesamiento de Voz
echo   Puerto 8002: Autenticacion y Seguridad JWA Zero-Login
echo   Puerto 8003: Tutor de Aprendizaje y Pedagogia
echo   Puerto 8004: Observabilidad y Metricas APM
echo =========================================================================

start "Microservicio 1 - Voz (8001)" cmd /k python backend/microservicio_1_voz.py
start "Microservicio 2 - Auth (8002)" cmd /k python backend/microservicio_2_auth.py
start "Microservicio 3 - Learning (8003)" cmd /k python backend/microservicio_3_learning.py
start "Microservicio 4 - Monitoring (8004)" cmd /k python backend/microservicio_4_monitoring.py

echo.
echo Los 4 microservicios fueron iniciados en ventanas separadas.
echo Para probarlos ejecuta: python backend/probar_microservicios.py
echo.
pause
