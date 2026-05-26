# Desarrollo local: compila assets y arranca Laravel (sin Vite dev server)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

if (Test-Path "public\hot") {
    Remove-Item "public\hot" -Force
    Write-Host "Eliminado public/hot (evita pantalla en blanco sin npm run dev)"
}

Copy-Item "deploy\public.htaccess.local" "public\.htaccess" -Force
Write-Host "Aplicado public/.htaccess para desarrollo local"

npm run build
php artisan config:clear
php artisan serve
