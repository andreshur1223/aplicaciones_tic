# Centro de Aplicaciones TIC

Repositorio interno de aplicaciones para red privada empresarial. Permite a administradores publicar instaladores y a usuarios de la red descargarlos de forma controlada.

**URL de producción:** `http://192.168.61.27/repositorio`

## Stack

- **Backend:** Laravel 12 + PostgreSQL
- **Frontend:** React 19 + Vite + Tailwind CSS 4
- **Servidor:** Ubuntu + Apache
- **Autenticación admin:** Sesión web (cookies) vía API

## Requisitos

- PHP 8.2+
- Composer 2
- Node.js 20+ y npm
- PostgreSQL 14+
- Apache con `mod_rewrite`

## Instalación local

```bash
git clone <repo-url> repositorio-apps
cd repositorio-apps
composer install
cp .env.example .env
php artisan key:generate
```

Configure PostgreSQL en `.env`:

```env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=repositorio_apps
DB_USERNAME=repositorio
DB_PASSWORD=secret
```

Para desarrollo local con `php artisan serve` (sin subruta `/repositorio`):

```env
APP_URL=http://127.0.0.1:8000
# No definir ASSET_URL en local (evita CORS con la IP de producción)
SESSION_PATH=/
VITE_APP_BASE=
VITE_BASE_PATH=/build/
```

Luego: `npm run build` y `php artisan serve`.

**Pantalla en blanco:** si existe `public/hot` pero no está corriendo `npm run dev`, borre ese archivo o ejecute `.\scripts\dev-local.ps1`. No use `npm run dev` y `php artisan serve` a la vez salvo que mantenga ambos procesos activos.

En producción use `ASSET_URL` y `VITE_APP_BASE=/repositorio` como en `.env.example`.

```bash
npm install
npm run build
php artisan migrate --seed
php artisan serve
```

En otra terminal: `npm run dev` (opcional, hot reload).

## Usuario administrador inicial

| Campo    | Valor              |
|----------|--------------------|
| Email    | admin@local.test   |
| Password | Admin12345*        |

Creado con `php artisan db:seed`.

## Rutas principales

| Ruta | Descripción |
|------|-------------|
| `/repositorio` | Portal público |
| `/repositorio/apps` | Catálogo |
| `/repositorio/apps/{slug}` | Detalle |
| `/repositorio/download/{slug}` | Descarga directa |
| `/repositorio/share/{token}` | Página del enlace compartido (detalles + botón descargar) |
| `/repositorio/share/{token}/download` | Descarga del archivo (solo al usar el botón) |
| `/repositorio/admin` | Panel administrativo |
| `/repositorio/admin/login` | Login |

## API

- Público: `GET /api/public/categories`, `GET /api/public/applications`, etc.
- Admin: `POST /api/admin/login`, CRUD categorías/aplicaciones, logs, enlaces compartibles.

## Configuración Apache (producción)

Ver `deploy/apache-repositorio.conf`:

```apache
Alias /repositorio /var/www/repositorio-apps/public

<Directory /var/www/repositorio-apps/public>
    Options -Indexes +FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

Variables `.env` en servidor:

```env
APP_URL=http://192.168.61.27/repositorio
ASSET_URL=http://192.168.61.27/repositorio
SESSION_PATH=/repositorio
SANCTUM_STATEFUL_DOMAINS=192.168.61.27
VITE_BASE_PATH=/repositorio/build/
```

## Despliegue en Ubuntu Server

```bash
sudo mkdir -p /var/www/repositorio-apps
sudo chown $USER:www-data /var/www/repositorio-apps
# clonar repositorio en esa ruta
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## Almacenamiento de instaladores

Los archivos se guardan en `storage/app/private/installers` (disco `installers`). **No** se exponen en `public/`.

Extensiones permitidas: exe, msi, zip, rar, 7z, pdf, doc, docx, xls, xlsx, bat, ps1, cfg.

Tamaño máximo en la aplicación: `REPOSITORIO_MAX_UPLOAD_KB` (por defecto **2097152 KB = 2 GB**), para instaladores de ~350 MB o más.

| Tamaño del archivo | Mínimo en `php.ini` | Recomendado |
|--------------------|---------------------|-------------|
| ~358 MB            | `400M`              | `1G` o `2G` |
| 500 MB – 1 GB      | igual al peso + margen | `2G`     |

### Error 413 (archivo muy pesado)

El 413 casi siempre significa que **PHP** (`post_max_size` / `upload_max_filesize`, hoy a menudo 40M) es menor que el instalador. La app puede permitir 2 GB, pero PHP debe acompañar.

1. Ver límites actuales:

```powershell
.\scripts\show-php-upload-limits.ps1
```

2. Editar `php.ini` (ruta con `php --ini`) — plantilla `docs/php-upload-limits.ini.example`:

```ini
upload_max_filesize = 2G
post_max_size = 2G
max_execution_time = 3600
```

3. En `.env`: `REPOSITORIO_MAX_UPLOAD_KB=2097152`

4. `php artisan config:clear` y **reiniciar** `php artisan serve` o Apache.

En Ubuntu/Apache: `LimitRequestBody` en `deploy/apache-repositorio.conf` (ya preparado para 2 GB).

## Seguridad

- Descargas solo vía controlador Laravel con validación de estado activo.
- Enlaces compartidos con expiración y límite de descargas opcionales.
- Rutas admin protegidas con sesión y middleware de usuario activo.
- Scripts `.bat` y `.ps1` permitidos con advertencia visual en la UI.
- Cambiar credenciales del admin inicial en producción.
- Mantener `APP_DEBUG=false` en producción.

## Licencia

Uso interno corporativo.
