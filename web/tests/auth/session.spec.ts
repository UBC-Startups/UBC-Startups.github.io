import { expect, test } from "@playwright/test";
import { NextRequest } from "next/server";
import { updateSession } from "../../lib/supabase/proxy";

const url = "https://test-project.supabase.co";
const cookieName = "sb-test-project-auth-token";
const user = {
  id: "11111111-1111-4111-8111-111111111111",
  aud: "authenticated",
  role: "authenticated",
  email: "test@example.com",
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};

function token(expiresAt: number) {
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, aud: "authenticated", exp: expiresAt })}.${Buffer.from("test-signature").toString("base64url")}`;
}

test("session refresh preserves request cookies, response cookies, and cache headers", async () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const originalFetch = globalThis.fetch;
  const calls: string[] = [];
  const expiresAt = Math.floor(Date.now() / 1000) + 3600;
  const refreshedSession = {
    access_token: token(expiresAt),
    refresh_token: "new-refresh-token",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: expiresAt,
    user,
  };

  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  globalThis.fetch = async input => {
    const target = String(input);
    calls.push(target);
    if (target === `${url}/auth/v1/token?grant_type=refresh_token`) {
      return Response.json(refreshedSession);
    }
    if (target === `${url}/auth/v1/user`) return Response.json(user);
    throw new Error(`Unexpected auth request: ${target}`);
  };

  try {
    const oldSession = {
      ...refreshedSession,
      access_token: token(1),
      refresh_token: "old-refresh-token",
      expires_at: 1,
    };
    const cookie = `base64-${Buffer.from(JSON.stringify(oldSession)).toString("base64url")}`;
    const request = new NextRequest("http://localhost:3000/", {
      headers: { cookie: `${cookieName}=${cookie}` },
    });
    const response = await updateSession(request);
    expect(calls).toContain(`${url}/auth/v1/token?grant_type=refresh_token`);
    const refreshedCookie = response.cookies.get(cookieName)?.value;
    expect(refreshedCookie).toBeTruthy();
    expect(refreshedCookie).not.toBe(cookie);
    expect(request.cookies.get(cookieName)?.value).toBe(refreshedCookie);
    expect(response.headers.get("x-middleware-request-cookie")).toContain(refreshedCookie!);
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("pragma")).toBe("no-cache");
    expect(response.headers.get("expires")).toBe("0");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
});

test("public pages work without Supabase configuration", async () => {
  const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const originalKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    const response = await updateSession(new NextRequest("http://localhost:3000/"));
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.cookies.getAll()).toEqual([]);
    process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    await expect(updateSession(new NextRequest("http://localhost:3000/"))).rejects.toThrow(
      "Set NEXT_PUBLIC_SUPABASE_URL",
    );
  } finally {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
    if (originalKey === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    else process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = originalKey;
  }
});
