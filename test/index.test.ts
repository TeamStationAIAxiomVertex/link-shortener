import { describe, expect, it } from "vitest";
import worker, { type Env } from "../src/index";

const env: Env = {
  LINK_SECRET: "test-secret-with-enough-entropy",
  PUBLIC_BASE_URL: "https://go.teamstation.us",
  ALLOWED_ORIGINS: "https://teamstation.us,https://www.teamstation.us,https://cto.teamstation.dev"
};

async function request(path: string, init?: RequestInit): Promise<Response> {
  return worker.fetch(new Request(`https://go.teamstation.us${path}`, init), env);
}

describe("TeamStation link shortener", () => {
  it("creates a signed short URL for an allowed TeamStation URL", async () => {
    const response = await request("/api/shorten", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://teamstation.us/jobs/senior-engineer?source=linkedin" })
    });
    const body = await response.json<{ shortUrl: string; targetUrl: string }>();

    expect(response.status).toBe(200);
    expect(body.shortUrl).toMatch(/^https:\/\/go\.teamstation\.us\/r\//);
    expect(body.targetUrl).toBe("https://teamstation.us/jobs/senior-engineer?source=linkedin");
  });

  it("redirects a valid signed token", async () => {
    const shortenResponse = await request("/api/shorten?url=https%3A%2F%2Fcto.teamstation.dev%2Fmeetings%2Fdemo");
    const { shortUrl } = await shortenResponse.json<{ shortUrl: string }>();
    const redirectPath = new URL(shortUrl).pathname;
    const response = await request(redirectPath);

    expect(response.status).toBe(302);
    expect(response.headers.get("location")).toBe("https://cto.teamstation.dev/meetings/demo");
  });

  it("rejects URLs outside the allowlist", async () => {
    const response = await request("/api/shorten", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/jobs/senior-engineer" })
    });
    const body = await response.json<{ error: string }>();

    expect(response.status).toBe(400);
    expect(body.error).toBe("URL origin is not allowed");
  });

  it("rejects tampered redirect tokens", async () => {
    const shortenResponse = await request("/api/shorten?url=https%3A%2F%2Fteamstation.us%2Fjobs%2Fone");
    const { shortUrl } = await shortenResponse.json<{ shortUrl: string }>();
    const redirectPath = new URL(shortUrl).pathname.replace(/.$/, "x");
    const response = await request(redirectPath);

    expect(response.status).toBe(404);
  });
});
