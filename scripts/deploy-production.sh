#!/usr/bin/env bash
# Actualización en producción (ejecutar tras cada git pull)
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/repositorio-apps}"
WEB_USER="${WEB_USER:-www-data}"

echo "==> Despliegue — Centro de Aplicaciones TIC"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
    echo "ERROR: No existe .env. Ejecute primero: ./scripts/install-production.sh"
    exit 1
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    echo "ERROR: APP_KEY no configurado. Ejecute: php artisan key:generate --force"
    exit 1
fi

echo "==> git pull"
git pull origin main

echo "==> composer install"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> frontend (variables VITE_* desde .env)"
npm ci
npm run build

echo "==> .htaccess y limpieza dev"
cp deploy/public.htaccess.production public/.htaccess
rm -f public/hot

echo "==> migraciones"
php artisan migrate --force

echo "==> optimización"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "==> permisos storage"
mkdir -p storage/app/private/installers
mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R "${WEB_USER}:${WEB_USER}" storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache
chown -R "${WEB_USER}:${WEB_USER}" storage/app/private 2>/dev/null || true

if command -v systemctl >/dev/null 2>&1; then
    echo "==> recargar Apache"
    sudo systemctl reload apache2
fi

echo "==> Despliegue completado ($(date -Iseconds))"
