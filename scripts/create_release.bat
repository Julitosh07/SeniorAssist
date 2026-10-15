@echo off
setlocal
echo ===================================================
echo   SeniorAssist DevOps Release Automation (v1.0.0)
echo ===================================================
cd /d "%~dp0\.."

powershell -NoProfile -ExecutionPolicy Bypass -File "scripts\create_release.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Hubo un problema al generar el Release.
    pause
    exit /b %ERRORLEVEL%
)

echo.
pause
