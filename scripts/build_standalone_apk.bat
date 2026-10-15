@echo off
setlocal
echo ===================================================
echo   Compilando SeniorAssist APK Standalone Autonomo
echo ===================================================

cd /d "%~dp0\.."

set "JAVA_HOME=C:\Program Files\Java\jdk-21.0.10"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo 1. Empaquetando bundle JavaScript y assets...
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"
call npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res

echo 2. Empaquetando APK nativo con Gradle...
cd android
call gradlew.bat assembleDebug
cd ..

echo 3. Copiando APK a la raiz...
copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "SeniorAssist.apk"

echo ===================================================
echo   Listo! APK generado en: %CD%\SeniorAssist.apk
echo ===================================================
pause
