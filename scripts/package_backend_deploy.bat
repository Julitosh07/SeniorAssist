@echo off
setlocal
echo ===================================================
echo   SeniorAssist - Empaquetador de Despliegue AWS
echo   Plataforma: AWS Elastic Beanstalk (Python Nativo)
echo ===================================================
cd /d "%~dp0\.."

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\package_backend_deploy.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Error al empaquetar el despliegue.
    pause
    exit /b %ERRORLEVEL%
)

echo.
pause
