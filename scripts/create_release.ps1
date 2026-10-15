Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SeniorAssist DevOps Release Automation (v1.0.0)" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

$root = Resolve-Path "$PSScriptRoot\.."
Set-Location $root

Write-Host "`n[1/4] Ejecutando Quality Gate (55 Pruebas)..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] El Quality Gate fallo. No se puede generar el Release." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/4] Verificando existencia de binario SeniorAssist.apk..." -ForegroundColor Yellow
if (-not (Test-Path "SeniorAssist.apk")) {
    Write-Host "[ALERTA] No se encontro SeniorAssist.apk. Compilando ahora..." -ForegroundColor Magenta
    & "$root\scripts\build_standalone_apk.ps1"
}

Write-Host "`n[3/4] Generando Hash Criptografico SHA-256..." -ForegroundColor Yellow
$hashObj = Get-FileHash "SeniorAssist.apk" -Algorithm SHA256
$hashStr = $hashObj.Hash.ToLower()
$checksumLine = "$hashStr *SeniorAssist.apk"
Set-Content -Path "SHA256SUMS.txt" -Value "# SeniorAssist - Checksums de Verificacion Criptografica (SHA-256)`n# Generado para el Release v1.0.0`n`n$checksumLine"
Write-Host "Hash SHA-256 generado:" -ForegroundColor Green
Write-Host "  $hashStr" -ForegroundColor White

Write-Host "`n[4/4] Verificando Git Tag v1.0.0..." -ForegroundColor Yellow
$existingTag = git tag -l "v1.0.0"
if (-not $existingTag) {
    git add CHANGELOG.md SHA256SUMS.txt .github/workflows/release.yml scripts/create_release.ps1
    git commit -m "chore(release): release version v1.0.0 [skip ci]"
    git tag -a "v1.0.0" -m "SeniorAssist Release v1.0.0 - IEEE 830 Produccion"
    Write-Host "Git Tag v1.0.0 creado exitosamente." -ForegroundColor Green
} else {
    Write-Host "Git Tag v1.0.0 ya existe en el repositorio." -ForegroundColor Cyan
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "  RELEASE v1.0.0 COMPLETADO CON EXITO" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host "Artefactos listos para DEPLOY:"
Write-Host " - Binario: $root\SeniorAssist.apk"
Write-Host " - Hash:    $root\SHA256SUMS.txt"
Write-Host " - Notas:   $root\CHANGELOG.md"
