@echo off
title Microservicio 3: Tutor de Aprendizaje (Puerto 8003)
color 0D
cd /d "%~dp0\.."
echo =========================================================================
echo   INICIANDO MICROSERVICIO 3: TUTOR PEDAGOGICO IA (PUERTO 8003)
echo   Capas: 1. Validador (Pydantic) ^| 2. Logica (Pedagogia) ^| 3. Endpoint (REST)
echo =========================================================================
python backend/microservicio_3_learning.py
pause
