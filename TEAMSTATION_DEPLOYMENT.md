# TeamStation Polr Deployment Notes

This repository is based on upstream Polr.

Polr is not a Cloudflare Worker or Cloudflare Pages static app. It is a PHP/Lumen application with a MySQL database requirement. Cloudflare can sit in front of it for DNS, TLS, caching rules, WAF, and access controls, but the application itself needs a PHP-capable runtime and MySQL-compatible database.

## Runtime Requirements

- PHP runtime compatible with Polr's `composer.json`
- Composer
- MySQL or MySQL-compatible database
- Web server document root pointed at `public/`
- Writable application storage/cache paths as required by Laravel/Lumen

## Setup Summary

1. Provision PHP hosting and a MySQL database.
2. Point the web server document root to `public/`.
3. Install dependencies:

   ```bash
   composer install --no-dev -o
   ```

4. Configure the app through Polr setup at `/setup`, or prepare the equivalent environment file.
5. Run migrations after configuration:

   ```bash
   php artisan migrate
   ```

6. Put Cloudflare in front of the host using the TeamStation short-link domain.

## Product Impact

Polr stores link records in MySQL. That is different from the previous stateless Worker prototype, which did not save destination URLs. This is expected when using Polr because stored links, API lookup, user management, and click tracking are part of the product model.
