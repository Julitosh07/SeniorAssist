@echo off
setlocal
echo ===================================================
echo   SeniorAssist - Suite Integral de Pruebas DevOps
echo ===================================================
cd /d "%~dp0\.."

call npm test
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Algunas pruebas fallaron. Revisa la salida anterior.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ===================================================
echo   [EXITO] Todas las pruebas (55/55) fueron superadas.
echo ===================================================
pause
