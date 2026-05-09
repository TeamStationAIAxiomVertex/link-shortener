# TeamStation URL Shortener Deployment

Production target:

- Public hostname: `go.teamstation.us`
- Access model: internal TeamStation users only, enforced by Cloudflare Access
- App runtime: DigitalOcean Droplet with Apache, PHP, Composer, and MySQL
- Database: MySQL

## DigitalOcean Droplet

Use an Ubuntu Droplet. This app does not require Docker.

Install server packages:

```bash
sudo apt update
sudo apt install -y apache2 mysql-server composer unzip git \
  php php-cli php-mbstring php-xml php-curl php-mysql php-zip php-bcmath
sudo a2enmod rewrite headers
sudo systemctl enable --now apache2 mysql
```

Clone the repo:

```bash
sudo git clone https://github.com/TeamStationAIAxiomVertex/link-shortener.git /var/www/teamstation-link-shortener
cd /var/www/teamstation-link-shortener
```

Create the production env file:

```bash
sudo cp deploy/env.production.example .env
sudo nano .env
```

Use these production values:

```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=<32-character-random-secret>
APP_NAME="TeamStation URL Shortener"
APP_PROTOCOL="https://"
APP_ADDRESS="go.teamstation.us"
APP_STYLESHEET=""
POLR_SETUP_RAN=true

DB_CONNECTION=mysql
DB_HOST="127.0.0.1"
DB_PORT=3306
DB_DATABASE="teamstation_shortener"
DB_USERNAME="teamstation_shortener"
DB_PASSWORD="<strong-db-password>"

SETTING_PUBLIC_INTERFACE=true
POLR_ALLOW_ACCT_CREATION=false
POLR_ACCT_ACTIVATION=false
POLR_ACCT_CREATION_RECAPTCHA=false
SETTING_SHORTEN_PERMISSION=false
SETTING_INDEX_REDIRECT=""
SETTING_REDIRECT_404=false
SETTING_PASSWORD_RECOV=false
SETTING_AUTO_API=false
SETTING_ANON_API=true
SETTING_ANON_API_QUOTA=300
SETTING_PSEUDORANDOM_ENDING=true
SETTING_ADV_ANALYTICS=false
SETTING_RESTRICT_EMAIL_DOMAIN=false
SETTING_ALLOWED_EMAIL_DOMAINS=""
POLR_RECAPTCHA_SITE_KEY=""
POLR_RECAPTCHA_SECRET_KEY=""

APP_LOCALE=en
APP_FALLBACK_LOCALE=en
CACHE_DRIVER=file
SESSION_DRIVER=file
QUEUE_DRIVER=database

_API_KEY_LENGTH=15
_ANALYTICS_MAX_DAYS_DIFF=365
_PSEUDO_RANDOM_KEY_LENGTH=5
POLR_BASE=62
POLR_RELDATE="Jan 28, 2020"
POLR_VERSION="2.3.0"
POLR_SECRET_BYTES=2
TMP_SETUP_AUTH_KEY=""
MAXMIND_LICENSE_KEY=""
```

Create the database and user:

```bash
sudo mysql
```

```sql
CREATE DATABASE teamstation_shortener CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'teamstation_shortener'@'localhost' IDENTIFIED BY '<strong-db-password>';
GRANT ALL PRIVILEGES ON teamstation_shortener.* TO 'teamstation_shortener'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

Install dependencies and migrate:

```bash
sudo composer install --no-dev --optimize-autoloader --ignore-platform-reqs
sudo php scripts/patch-carbon.php
sudo php artisan migrate --force
sudo mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod +x deploy/deploy-droplet.sh
```

Configure Apache:

```bash
sudo cp deploy/apache-go.teamstation.us.conf /etc/apache2/sites-available/go.teamstation.us.conf
sudo a2dissite 000-default.conf
sudo a2ensite go.teamstation.us.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

Future deploys:

```bash
cd /var/www/teamstation-link-shortener
sudo APP_DIR=/var/www/teamstation-link-shortener ./deploy/deploy-droplet.sh
```

## Cloudflare

1. In Cloudflare DNS for `teamstation.us`, create:

```text
Type: CNAME
Name: go
Target: <your Droplet hostname or origin hostname>
Proxy: Proxied
```

If you only have the Droplet IP, use:

```text
Type: A
Name: go
IPv4 address: <your Droplet IP>
Proxy: Proxied
```

2. Set SSL/TLS mode to `Full` or `Full (strict)`.

3. Create a Cloudflare Access application:

```text
Application domain: go.teamstation.us
Policy: Allow TeamStation team members only
```

4. Keep `/login` and `/admin` disabled in the app. Team-only access should happen at Cloudflare Access.

## Local Test

Use the router and public document root together:

```bash
php -S localhost:9003 -t public server.php
```

Smoke tests:

```bash
curl -I http://localhost:9003/
curl -X POST http://localhost:9003/api/shorten \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://teamstation.ai/internal/test"}'
```
