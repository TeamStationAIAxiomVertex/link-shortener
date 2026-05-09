# TeamStation URL Shortener Deployment

Production target:

- Public hostname: `go.teamstation.us`
- Access model: internal TeamStation users only, enforced by Cloudflare Access
- App runtime: DigitalOcean App Platform or a DigitalOcean Droplet running Docker
- Database: MySQL

## DigitalOcean

Use the included `Dockerfile`.

Required environment variables:

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
DB_HOST=<mysql-host>
DB_PORT=25060
DB_DATABASE=<mysql-database>
DB_USERNAME=<mysql-user>
DB_PASSWORD=<mysql-password>

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

For first deploy, set:

```env
RUN_MIGRATIONS=true
```

After the first healthy deploy, set it back to:

```env
RUN_MIGRATIONS=false
```

This avoids migration work on every restart.

## Cloudflare

1. In Cloudflare DNS for `teamstation.us`, create:

```text
Type: CNAME
Name: go
Target: <your DigitalOcean app hostname>
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
