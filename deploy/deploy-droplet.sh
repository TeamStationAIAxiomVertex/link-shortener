#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/teamstation-link-shortener}"

cd "$APP_DIR"

git pull --ff-only origin main
composer install --no-dev --optimize-autoloader --ignore-platform-reqs
php scripts/patch-carbon.php
php artisan migrate --force

mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
chown -R www-data:www-data storage bootstrap/cache
find storage bootstrap/cache -type d -exec chmod 775 {} \;
find storage bootstrap/cache -type f -exec chmod 664 {} \;

php -l app/Http/routes.php
curl -fsS http://127.0.0.1/ >/dev/null
