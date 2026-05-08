# TeamStation Link Shortener

Stateless Cloudflare Worker URL shortener for TeamStation links.

## Design

This app does not use a database, KV namespace, Durable Object, analytics table, or any other link store. Instead, each short link carries a compact signed payload:

- The destination URL is normalized and encoded into the token.
- The token is signed with `LINK_SECRET` using HMAC-SHA-256.
- Redirects are only allowed for configured TeamStation origins.
- A tampered token returns `404` instead of redirecting.

Because there is no storage, generated links cannot be tiny opaque slugs like `abc123` unless a store is added later. The tradeoff is operational simplicity and no retained link records.

## Routes

- `GET /` - small form UI
- `GET /api/shorten?url=https://teamstation.us/...` - create a short URL
- `POST /api/shorten` with `{ "url": "https://teamstation.us/..." }` - create a short URL
- `GET /r/:token` - redirect to the signed destination
- `GET /health` - health check

## Local setup

```bash
npm install
printf 'LINK_SECRET="%s"\n' "$(openssl rand -base64 32)" > .dev.vars
npm run dev
```

Then open `http://localhost:8787`.

## Cloudflare setup

Set the production secret before deploy:

```bash
npx wrangler secret put LINK_SECRET
```

Set `PUBLIC_BASE_URL` in `wrangler.jsonc` to the deployed domain before production deploy, for example:

```jsonc
"PUBLIC_BASE_URL": "https://go.teamstation.us"
```

Deploy:

```bash
npm run deploy
```

## Configuration

`ALLOWED_ORIGINS` is a comma-separated allowlist:

```jsonc
"ALLOWED_ORIGINS": "https://teamstation.us,https://www.teamstation.us,https://cto.teamstation.dev"
```

Add meeting or job-link hosts here before deploying if they live on a different TeamStation-controlled domain.
