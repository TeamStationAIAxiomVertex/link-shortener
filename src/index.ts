export interface Env {
  LINK_SECRET?: string;
  PUBLIC_BASE_URL?: string;
  ALLOWED_ORIGINS?: string;
}

interface ShortenResponse {
  shortUrl: string;
  targetUrl: string;
}

interface SignedPayload {
  v: 1;
  o: number;
  p: string;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const tokenPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      return await routeRequest(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        return json({ error: error.message }, error.status);
      }

      console.error(
        JSON.stringify({
          level: "error",
          message: "Unhandled request error",
          error: error instanceof Error ? error.message : String(error)
        })
      );
      return json({ error: "Internal server error" }, 500);
    }
  }
};

export async function routeRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/") {
    return html(renderHome(url.origin));
  }

  if (request.method === "GET" && url.pathname === "/health") {
    return json({ ok: true });
  }

  if (url.pathname === "/api/shorten") {
    return shorten(request, env);
  }

  if (request.method === "GET" && url.pathname.startsWith("/r/")) {
    const token = decodeURIComponent(url.pathname.slice("/r/".length));
    return redirectFromToken(token, env);
  }

  return json({ error: "Not found" }, 404);
}

async function shorten(request: Request, env: Env): Promise<Response> {
  if (request.method !== "GET" && request.method !== "POST") {
    return json({ error: "Method not allowed" }, 405, { Allow: "GET, POST" });
  }

  const target = await readTargetUrl(request);
  if (!target) {
    return json({ error: "Missing url" }, 400);
  }

  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  const normalized = normalizeTargetUrl(target, allowedOrigins);
  const token = await createToken(normalized, allowedOrigins, env);
  const baseUrl = getPublicBaseUrl(request, env);
  const body: ShortenResponse = {
    shortUrl: `${baseUrl}/r/${token}`,
    targetUrl: normalized.toString()
  };

  return json(body);
}

async function redirectFromToken(token: string, env: Env): Promise<Response> {
  if (!tokenPattern.test(token)) {
    return json({ error: "Not found" }, 404);
  }

  const allowedOrigins = parseAllowedOrigins(env.ALLOWED_ORIGINS);
  const destination = await readToken(token, allowedOrigins, env);
  if (!destination) {
    return json({ error: "Not found" }, 404);
  }

  return Response.redirect(destination.toString(), 302);
}

async function readTargetUrl(request: Request): Promise<string | null> {
  const requestUrl = new URL(request.url);

  if (request.method === "GET") {
    return requestUrl.searchParams.get("url");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }

  const body = await request.json<unknown>();
  if (!isRecord(body) || typeof body.url !== "string") {
    return null;
  }

  return body.url;
}

function normalizeTargetUrl(input: string, allowedOrigins: string[]): URL {
  let target: URL;
  try {
    target = new URL(input);
  } catch {
    throw new HttpError("Invalid URL", 400);
  }

  if (target.protocol !== "https:") {
    throw new HttpError("Only HTTPS URLs are allowed", 400);
  }

  const allowed = allowedOrigins.includes(target.origin);
  if (!allowed) {
    throw new HttpError("URL origin is not allowed", 400);
  }

  return target;
}

async function createToken(target: URL, allowedOrigins: string[], env: Env): Promise<string> {
  const originIndex = allowedOrigins.indexOf(target.origin);
  if (originIndex < 0) {
    throw new HttpError("URL origin is not allowed", 400);
  }

  const payload: SignedPayload = {
    v: 1,
    o: originIndex,
    p: `${target.pathname}${target.search}${target.hash}`
  };
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signature = await sign(encodedPayload, env);

  return `${encodedPayload}.${signature}`;
}

async function readToken(token: string, allowedOrigins: string[], env: Env): Promise<URL | null> {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = await sign(encodedPayload, env);
  if (!constantTimeEqual(signature, expectedSignature)) {
    return null;
  }

  let payload: unknown;
  try {
    payload = JSON.parse(decoder.decode(base64UrlDecode(encodedPayload)));
  } catch {
    return null;
  }

  if (!isSignedPayload(payload)) {
    return null;
  }

  const origin = allowedOrigins[payload.o];
  if (!origin) {
    return null;
  }

  try {
    return new URL(payload.p, origin);
  } catch {
    return null;
  }
}

async function sign(value: string, env: Env): Promise<string> {
  if (!env.LINK_SECRET) {
    throw new HttpError("LINK_SECRET is not configured", 500);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(env.LINK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return base64UrlEncode(new Uint8Array(signature).slice(0, 16));
}

function parseAllowedOrigins(value: string | undefined): string[] {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin).origin);
}

function getPublicBaseUrl(request: Request, env: Env): string {
  if (env.PUBLIC_BASE_URL) {
    return new URL(env.PUBLIC_BASE_URL).origin;
  }

  return new URL(request.url).origin;
}

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function constantTimeEqual(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const maxLength = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < maxLength; index += 1) {
    diff |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }

  return diff === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSignedPayload(value: unknown): value is SignedPayload {
  return (
    isRecord(value) &&
    value.v === 1 &&
    typeof value.o === "number" &&
    Number.isInteger(value.o) &&
    value.o >= 0 &&
    typeof value.p === "string" &&
    value.p.startsWith("/")
  );
}

function html(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function json(body: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

function renderHome(origin: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TeamStation Link Shortener</title>
  <style>
    :root {
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #17202a;
      background: #f7f8fb;
    }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
    }
    main {
      width: min(720px, 100%);
      display: grid;
      gap: 18px;
    }
    h1 {
      margin: 0;
      font-size: clamp(2rem, 5vw, 3.5rem);
      line-height: 1;
    }
    p {
      margin: 0;
      color: #5a6878;
      font-size: 1rem;
      line-height: 1.55;
    }
    form {
      display: grid;
      gap: 12px;
      padding: 18px;
      border: 1px solid #dbe1ea;
      border-radius: 8px;
      background: #ffffff;
    }
    label {
      font-size: 0.875rem;
      font-weight: 700;
    }
    input {
      min-width: 0;
      width: 100%;
      box-sizing: border-box;
      border: 1px solid #c8d0dc;
      border-radius: 6px;
      padding: 12px 14px;
      font: inherit;
    }
    button {
      width: fit-content;
      border: 0;
      border-radius: 6px;
      background: #0b5cff;
      color: white;
      padding: 11px 16px;
      font: inherit;
      font-weight: 800;
      cursor: pointer;
    }
    output {
      min-height: 28px;
      overflow-wrap: anywhere;
      color: #17427c;
    }
  </style>
</head>
<body>
  <main>
    <h1>TeamStation Link Shortener</h1>
    <p>Create signed redirect links for approved TeamStation URLs without storing destination records.</p>
    <form id="shorten-form">
      <label for="url">TeamStation URL</label>
      <input id="url" name="url" type="url" placeholder="https://teamstation.us/..." required>
      <button type="submit">Shorten</button>
      <output id="result" aria-live="polite"></output>
    </form>
  </main>
  <script>
    const form = document.getElementById("shorten-form");
    const input = document.getElementById("url");
    const result = document.getElementById("result");

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      result.textContent = "Creating link...";

      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: input.value })
      });
      const body = await response.json();

      if (!response.ok) {
        result.textContent = body.error || "Unable to create link.";
        return;
      }

      result.innerHTML = '<a href="' + body.shortUrl + '">' + body.shortUrl + '</a>';
    });
  </script>
</body>
</html>`;
}

class HttpError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
  }
}

export async function handleError(error: unknown): Promise<Response> {
  if (error instanceof HttpError) {
    return json({ error: error.message }, error.status);
  }

  throw error;
}
