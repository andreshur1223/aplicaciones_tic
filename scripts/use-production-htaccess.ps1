# Restaura .htaccess de producción (solo si prueba con Apache en subruta /repositorio)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..
Copy-Item "deploy\public.htaccess.production" "public\.htaccess" -Force
Write-Host "Aplicado deploy/public.htaccess.production -> public/.htaccess"
