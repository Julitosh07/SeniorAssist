@echo off
title Cliente de Prueba de Microservicios
color 0E
cd /d "%~dp0\.."
echo =========================================================================
echo   EJECUTANDO PRUEBAS DE CONSUMO DE MICROSERVICIOS (8001 y 8002)
echo =========================================================================
python backend/probar_microservicios.py
pause
