#!/usr/bin/env bash
# Instalación inicial en Ubuntu Server (ejecutar UNA vez en /var/www/repositorio-apps)
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/repositorio-apps}"
WEB_USER="${WEB_USER:-www-data}"

echo "==> Instalación inicial — Centro de Aplicaciones TIC"
echo "    Directorio: $APP_DIR"
cd "$APP_DIR"

if [[ ! -f .env ]]; then
    if [[ -f deploy/.env.production.example ]]; then
        cp deploy/.env.production.example .env
        echo "==> Creado .env desde deploy/.env.production.example — EDITE contraseñas y APP_KEY antes de continuar."
    else
        cp .env.example .env
        echo "==> Creado .env desde .env.example — configure producción manualmente."
    fi
fi

if ! grep -q '^APP_KEY=base64:' .env 2>/dev/null; then
    php artisan key:generate --force
fi

echo "==> Dependencias PHP"
composer install --no-dev --optimize-autoloader --no-interaction

echo "==> Dependencias frontend y build"
if command -v npm >/dev/null 2>&1; then
    npm ci
    npm run build
else
    echo "ERROR: npm no está instalado. Instale Node.js 20+ y vuelva a ejecutar."
    exit 1
fi

echo "==> Apache: .htaccess de producción"
cp deploy/public.htaccess.production public/.htaccess
rm -f public/hot

echo "==> Base de datos"
php artisan migrate --force
php artisan db:seed --force

echo "==> Permisos"
mkdir -p storage/app/private/installers
mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache
chown -R "${WEB_USER}:${WEB_USER}" storage bootstrap/cache
chmod -R ug+rwx storage bootstrap/cache

echo "==> Caché de configuración"
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ""
echo "==> Instalación completada."
echo "    1. Revise .env (DB_PASSWORD, APP_URL, SANCTUM_STATEFUL_DOMAINS)"
echo "    2. Configure Apache: deploy/apache-repositorio.conf"
echo "    3. Ajuste php.ini según docs/php-upload-limits.ini.example"
echo "    4. Cambie la contraseña del admin (admin@local.test) tras el primer acceso"
echo "    URL: $(grep '^APP_URL=' .env | cut -d= -f2-)/admin"
