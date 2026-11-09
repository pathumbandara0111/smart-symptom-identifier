/**
 * Admin session helpers.
 * Signed (HMAC-SHA256) token stored in an HttpOnly cookie. Uses Web Crypto so it
 * works in both the Node runtime and proxy.ts.
 */
import { NextRequest, NextResponse } from "next/server";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_SESSION_SECONDS = 60 * 60 * 8; // 8 hours

function getSecret(): string {
  const s = process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET (or NEXTAUTH_SECRET) must be set (16+ chars)");
  }
  return s;
}

const enc = new TextEncoder();

function toB64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64Url(s: string): Uint8Array {
  const pad = s.length % 4 ? "=".repeat(4 - (s.length % 4)) : "";
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function hmacKey(usage: "sign" | "verify") {
  return crypto.subtle.importKey("raw", enc.encode(getSecret()), { name: "HMAC", hash: "SHA-256" }, false, [usage]);
}

export async function signAdminToken(adminId: string): Promise<string> {
  const payload = toB64Url(
    enc.encode(JSON.stringify({ sub: adminId, exp: Math.floor(Date.now() / 1000) + ADMIN_SESSION_SECONDS }))
  );
  const sig = await crypto.subtle.sign("HMAC", await hmacKey("sign"), enc.encode(payload));
  return `${payload}.${toB64Url(sig)}`;
}

export async function verifyAdminToken(token?: string | null): Promise<{ sub: string } | null> {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  try {
    const ok = await crypto.subtle.verify(
      "HMAC",
      await hmacKey("verify"),
      fromB64Url(sig) as BufferSource,
      enc.encode(payload)
    );
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(fromB64Url(payload)));
    if (!data.sub || typeof data.exp !== "number" || data.exp < Math.floor(Date.now() / 1000)) return null;
    return { sub: data.sub };
  } catch {
    return null;
  }
}

/** Returns a 401 response if the request has no valid admin session, otherwise null. */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | null> {
  const session = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);
  if (!session) {
    return NextResponse.json({ error: "Admin authentication required" }, { status: 401 });
  }
  return null;
}
