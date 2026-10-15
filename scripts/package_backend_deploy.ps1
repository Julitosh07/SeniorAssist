Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SeniorAssist - Empaquetador de Despliegue AWS" -ForegroundColor Cyan
Write-Host "  Plataforma: AWS Elastic Beanstalk (Python Nativo)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

$distDir = "$root\dist"
if (-not (Test-Path $distDir)) {
    New-Item -ItemType Directory -Path $distDir -Force | Out-Null
}

$zipPath = "$distDir\seniorassist-backend-deploy.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Write-Host "`n[1/3] Verificando archivos de configuracion PaaS (Sin Docker)..." -ForegroundColor Yellow
if (-not (Test-Path "Procfile")) {
    Write-Host "[ERROR] Falta el archivo Procfile requerido por AWS Beanstalk." -ForegroundColor Red
    exit 1
}
if (-not (Test-Path ".ebextensions\01_fastapi.config")) {
    Write-Host "[ERROR] Falta la configuracion .ebextensions/01_fastapi.config." -ForegroundColor Red
    exit 1
}

Write-Host "[2/3] Generando bundle de despliegue zip para AWS Elastic Beanstalk..." -ForegroundColor Yellow
$tempStage = "$distDir\stage_deploy"
if (Test-Path $tempStage) {
    Remove-Item $tempStage -Recurse -Force
}
New-Item -ItemType Directory -Path $tempStage -Force | Out-Null

# Copiar archivos esenciales excluyendo caches y tests locales
Copy-Item "Procfile" "$tempStage\"
Copy-Item "backend\requirements.txt" "$tempStage\"
Copy-Item -Recurse ".ebextensions" "$tempStage\"
Copy-Item -Recurse "backend\app" "$tempStage\backend\app"

# Limpiar posibles __pycache__ dentro de app
Get-ChildItem -Path "$tempStage\backend\app" -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force

# Comprimir a zip
Compress-Archive -Path "$tempStage\*" -DestinationPath $zipPath -Force
Remove-Item $tempStage -Recurse -Force

Write-Host "[3/3] Calculando tamano y hash del paquete de despliegue..." -ForegroundColor Yellow
$zipItem = Get-Item $zipPath
$zipHash = (Get-FileHash $zipPath -Algorithm SHA256).Hash

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  PAQUETE DE DESPLIEGUE GENERADO CON EXITO" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Destino: $zipPath"
Write-Host "Tamano:  $([math]::Round($zipItem.Length / 1KB, 2)) KB"
Write-Host "Hash:    $zipHash"
Write-Host "`nEste archivo zip esta listo para ser subido directamente a:"
Write-Host "-> Consola de AWS Elastic Beanstalk (Python 3.10 / Amazon Linux 2023)"
Write-Host "-> O desplegado automaticamente mediante el pipeline .github/workflows/deploy.yml"
