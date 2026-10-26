@echo off
title Microservicio 1: NLU y Voz (Puerto 8001)
color 0A
cd /d "%~dp0\.."
echo =========================================================================
echo   INICIANDO MICROSERVICIO 1: NLU Y PROCESAMIENTO DE VOZ (PUERTO 8001)
echo   Capas: 1. Validador (Pydantic) ^| 2. Lógica (NLU) ^| 3. Endpoint (REST)
echo =========================================================================
python backend/microservicio_1_voz.py
pause
