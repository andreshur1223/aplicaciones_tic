# Muestra límites de subida de PHP y comparación con la app
Write-Host "=== PHP (php.ini) ===" -ForegroundColor Cyan
php -r @"
echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . PHP_EOL;
echo 'post_max_size:       ' . ini_get('post_max_size') . PHP_EOL;
echo 'memory_limit:        ' . ini_get('memory_limit') . PHP_EOL;
echo 'max_execution_time:  ' . ini_get('max_execution_time') . PHP_EOL;
"@

Write-Host ""
Write-Host "=== Archivos php.ini cargados ===" -ForegroundColor Cyan
php --ini

Write-Host ""
Write-Host "=== Recomendacion para instaladores pesados (358 MB o mas) ===" -ForegroundColor Yellow
Write-Host "  En php.ini use al menos:"
Write-Host "    upload_max_filesize = 2G"
Write-Host "    post_max_size = 2G"
Write-Host ""
Write-Host "  Plantilla: docs\php-upload-limits.ini.example"
Write-Host "  En .env:   REPOSITORIO_MAX_UPLOAD_KB=2097152"
Write-Host ""
Write-Host "  Despues de editar php.ini, reinicie php artisan serve." -ForegroundColor Green
