@echo off
echo ===================================================
echo Instalando SeniorAssist APK en dispositivo Android
echo ===================================================

set "PATH=C:\Users\julio\AppData\Local\Android\Sdk\platform-tools;%PATH%"

adb devices
echo.
echo Instalando APK...
if exist "SeniorAssist.apk" (
    adb install -r "SeniorAssist.apk"
) else if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
    adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
) else (
    echo No se encontro el archivo APK.
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [EXITO] SeniorAssist se instalo correctamente en tu dispositivo Android!
    echo Puedes buscar el icono "SeniorAssist" en la pantalla de inicio de tu telefono.
) else (
    echo.
    echo [AVISO] Si no se pudo instalar, verifica:
    echo 1. Que tu celular este conectado por cable USB con "Depuracion USB" activada.
    echo 2. O que tengas un emulador Android (AVD) abierto.
)
echo.
pause
