/**
 * Small in-memory rate limiter / lockout (per server instance).
 * Good enough for a single-node deployment; swap for Redis if you scale out.
 */
type Entry = { count: number; resetAt: number };
const store = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const e = store.get(key);
  if (!e || e.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  e.count += 1;
  const allowed = e.count <= limit;
  return { allowed, remaining: Math.max(0, limit - e.count), retryAfterSec: allowed ? 0 : Math.ceil((e.resetAt - now) / 1000) };
}

/** Check without counting (used for lockouts that only count failures). */
export function isLocked(key: string, limit: number) {
  const e = store.get(key);
  if (!e || e.resetAt < Date.now()) return { locked: false, retryAfterSec: 0 };
  return { locked: e.count >= limit, retryAfterSec: Math.ceil((e.resetAt - Date.now()) / 1000) };
}

export function recordFailure(key: string, windowMs: number) {
  const now = Date.now();
  const e = store.get(key);
  if (!e || e.resetAt < now) store.set(key, { count: 1, resetAt: now + windowMs });
  else e.count += 1;
}

export function clearKey(key: string) {
  store.delete(key);
}

export function clientIp(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || request.headers.get("x-real-ip") || "unknown";
}

// Periodic cleanup so the map cannot grow forever
if (typeof setInterval !== "undefined") {
  const t = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (v.resetAt < now) store.delete(k);
  }, 10 * 60 * 1000);
  (t as any).unref?.();
}
