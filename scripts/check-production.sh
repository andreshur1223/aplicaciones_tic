#!/usr/bin/env bash
# Comprueba requisitos antes o después del despliegue
set -euo pipefail

APP_DIR="${APP_DIR:-$(cd "$(dirname "$0")/.." && pwd)}"
cd "$APP_DIR"

ERR=0

check() {
    if eval "$2" >/dev/null 2>&1; then
        echo "  [OK] $1"
    else
        echo "  [FALTA] $1"
        ERR=1
    fi
}

echo "==> Comprobación de entorno"
check "PHP 8.2+" "php -r 'exit(version_compare(PHP_VERSION,\"8.2.0\",\"<\")?1:0);'"
check "Composer" "composer --version"
check "Node.js" "node --version"
check "npm" "npm --version"
check "PostgreSQL cliente" "psql --version"

echo ""
echo "==> Archivos del proyecto"
check ".env existe" "test -f .env"
check "vendor/autoload.php" "test -f vendor/autoload.php"
check "public/build/manifest.json" "test -f public/build/manifest.json"
check "APP_KEY en .env" "grep -q '^APP_KEY=base64:' .env"
check ".htaccess producción" "grep -q 'RewriteBase /repositorio/' public/.htaccess"
check "sin public/hot" "test ! -f public/hot"

echo ""
echo "==> PHP (subidas)"
php -r "echo '  upload_max_filesize='.ini_get('upload_max_filesize').PHP_EOL;"
php -r "echo '  post_max_size='.ini_get('post_max_size').PHP_EOL;"

if [[ -f .env ]]; then
    echo ""
    echo "==> Variables críticas .env"
    for key in APP_ENV APP_DEBUG APP_URL ASSET_URL SESSION_PATH VITE_APP_BASE VITE_BASE_PATH; do
        if grep -q "^${key}=" .env; then
            echo "  $key=$(grep "^${key}=" .env | cut -d= -f2-)"
        else
            echo "  [FALTA] $key"
            ERR=1
        fi
    done
fi

echo ""
if [[ $ERR -eq 0 ]]; then
    echo "==> Todo correcto."
else
    echo "==> Hay problemas que corregir antes de usar en producción."
    exit 1
fi
