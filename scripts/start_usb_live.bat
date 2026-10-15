@echo off
setlocal
echo ===================================================
echo   SeniorAssist - Modo Pruebas en Vivo por USB
echo ===================================================

cd /d "%~dp0\.."

set "ADB_PATH=C:\Users\julio\AppData\Local\Android\Sdk\platform-tools\adb.exe"

echo 1. Comprobando conexion del celular por USB (ADB)...
"%ADB_PATH%" devices

echo 2. Enrutando puerto 8081 al celular (adb reverse)...
"%ADB_PATH%" reverse tcp:8081 tcp:8081

echo 3. Iniciando servidor de desarrollo Expo/Metro...
echo [INFO] Cualquier cambio en el codigo se reflejara de inmediato en tu celular.
call npx expo start
pause
