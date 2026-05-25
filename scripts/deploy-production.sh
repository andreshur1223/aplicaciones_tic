#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/repositorio-apps"
WEB_USER="www-data"

echo "==> Despliegue Centro de Aplicaciones TIC"
cd "$APP_DIR"

echo "==> git pull"
git pull origin main

echo "==> composer install"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> npm install && build"
npm ci
npm run build

echo "==> migraciones"
php artisan migrate --force

echo "==> optimización"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> permisos storage y cache"
chown -R "${WEB_USER}:${WEB_USER}" storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache
mkdir -p storage/app/private/installers
chown -R "${WEB_USER}:${WEB_USER}" storage/app/private

echo "==> recargar Apache"
sudo systemctl reload apache2

echo "==> Despliegue completado"
