# Desarrollo local: compila assets y arranca Laravel (sin Vite dev server)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (Test-Path "public\hot") {
    Remove-Item "public\hot" -Force
    Write-Host "Eliminado public/hot (evita pantalla en blanco sin npm run dev)"
}

npm run build
php artisan config:clear
php artisan serve
