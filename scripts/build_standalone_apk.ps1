Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SeniorAssist DevOps Build Automation (PowerShell)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

$env:JAVA_HOME = "C:\Program Files\Java\jdk-21.0.10"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

Write-Host "`n[1/3] Verificando compilacion TypeScript (TypeCheck)..." -ForegroundColor Yellow
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en verificacion TypeScript. Abortando compilacion." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/3] Empaquetando JavaScript bundle y assets con Metro..." -ForegroundColor Yellow
if (-not (Test-Path "android\app\src\main\assets")) {
    New-Item -ItemType Directory -Path "android\app\src\main\assets" -Force | Out-Null
}
npx expo export:embed --platform android --dev false --entry-file index.ts --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error empaquetando JavaScript Bundle." -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/3] Compilando APK binario con Gradle Wrapper..." -ForegroundColor Yellow
Set-Location "$root\android"
.\gradlew.bat assembleDebug
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error en compilacion Gradle." -ForegroundColor Red
    Set-Location $root
    exit 1
}
Set-Location $root

Copy-Item "android\app\build\outputs\apk\debug\app-debug.apk" "SeniorAssist.apk" -Force

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  EXITO: Artefacto generado en $root\SeniorAssist.apk" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Get-Item "$root\SeniorAssist.apk" | Select-Object Name, Length, LastWriteTime
