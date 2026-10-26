@echo off
title Microservicio 2: Seguridad JWA Zero-Login (Puerto 8002)
color 0B
cd /d "%~dp0\.."
echo =========================================================================
echo   INICIANDO MICROSERVICIO 2: AUTENTICACIÓN JWA HS256 (PUERTO 8002)
echo   Capas: 1. Validador (Pydantic) ^| 2. Lógica (JWA) ^| 3. Endpoint (REST)
echo =========================================================================
python backend/microservicio_2_auth.py
pause
