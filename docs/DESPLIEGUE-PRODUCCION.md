# Despliegue en producción — Centro de Aplicaciones TIC

Guía paso a paso para Ubuntu Server + Apache bajo `http://192.168.61.27/repositorio`.

## 1. Requisitos del servidor

| Componente | Versión mínima |
|------------|----------------|
| Ubuntu Server | 22.04+ |
| PHP | 8.2+ (extensiones: pgsql, mbstring, xml, curl, zip, fileinfo, openssl) |
| Composer | 2.x |
| Node.js | 20+ |
| PostgreSQL | 14+ |
| Apache | con `mod_rewrite` |

```bash
sudo apt update
sudo apt install -y apache2 php php-pgsql php-mbstring php-xml php-curl php-zip composer nodejs npm postgresql
```

## 2. Base de datos PostgreSQL

```bash
sudo -u postgres psql
```

```sql
CREATE USER repositorio WITH PASSWORD 'su_password_seguro';
CREATE DATABASE repositorio_apps OWNER repositorio;
\q
```

## 3. Clonar el proyecto

```bash
sudo mkdir -p /var/www/repositorio-apps
sudo chown $USER:www-data /var/www/repositorio-apps
git clone https://github.com/andreshur1223/aplicaciones_tic.git /var/www/repositorio-apps
cd /var/www/repositorio-apps
```

## 4. Instalación inicial (solo una vez)

```bash
chmod +x scripts/*.sh
./scripts/install-production.sh
```

El script:

- Crea `.env` desde `deploy/.env.production.example`
- Genera `APP_KEY`
- Instala dependencias, compila React (`npm run build`)
- Aplica migraciones y seed (admin inicial)
- Copia `.htaccess` de producción
- Configura permisos de `storage/`

**Edite `.env`** antes de usar en red:

```bash
nano .env
# DB_PASSWORD, APP_URL, SANCTUM_STATEFUL_DOMAINS
php artisan config:clear && php artisan config:cache
```

## 5. Apache

Copie el fragmento de `deploy/apache-repositorio.conf` a su VirtualHost, por ejemplo:

```bash
sudo cp deploy/apache-repositorio.conf /etc/apache2/conf-available/repositorio.conf
sudo a2enconf repositorio
sudo systemctl reload apache2
```

Compruebe que el `Alias` apunta a `.../public` y que `AllowOverride All` está activo.

## 6. PHP — archivos grandes (350 MB+)

Edite `php.ini` (ver `php --ini`) usando `docs/php-upload-limits.ini.example`:

```ini
upload_max_filesize = 2G
post_max_size = 2G
max_execution_time = 3600
```

Reinicie Apache: `sudo systemctl restart apache2`

## 7. Actualizaciones (cada cambio en Git)

```bash
cd /var/www/repositorio-apps
./scripts/deploy-production.sh
```

No ejecuta `db:seed` de nuevo (evita resetear el admin).

## 8. Verificación

```bash
./scripts/check-production.sh
```

Debe mostrar todo `[OK]`. Pruebe en el navegador:

- `http://192.168.61.27/repositorio` — portal
- `http://192.168.61.27/repositorio/admin/login` — panel admin

## 9. Errores frecuentes

| Síntoma | Solución |
|---------|----------|
| Pantalla en blanco | Borrar `public/hot`; ejecutar `npm run build`; revisar `public/build/manifest.json` |
| 404 en rutas React | Copiar `deploy/public.htaccess.production` → `public/.htaccess` |
| 419 / CSRF en admin | `SESSION_PATH=/repositorio`, `SANCTUM_STATEFUL_DOMAINS` con la IP del servidor |
| 413 al subir archivo | Subir `post_max_size` y `upload_max_filesize` en php.ini |
| Assets sin estilo | `ASSET_URL` y `VITE_BASE_PATH=/repositorio/build/` en `.env`, luego `npm run build` |
| 500 tras deploy | `storage/logs/laravel.log`, permisos `www-data` en `storage` |

## 10. Seguridad en producción

- `APP_DEBUG=false`
- Cambiar contraseña del admin (`admin@local.test` / `Admin12345*` del seed)
- No subir `.env` a Git
- Backups de PostgreSQL y de `storage/app/private/installers`

## 11. Desarrollo local vs producción

| | Local | Producción |
|---|--------|------------|
| `.htaccess` | `deploy/public.htaccess.local` | `deploy/public.htaccess.production` |
| `APP_URL` | `http://127.0.0.1:8000` | `http://192.168.61.27/repositorio` |
| `SESSION_PATH` | `/` | `/repositorio` |
| `VITE_APP_BASE` | vacío | `/repositorio` |

En Windows (desarrollo): `.\scripts\dev-local.ps1`
