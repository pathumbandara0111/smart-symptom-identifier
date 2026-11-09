import type { AiLogger } from "./logger";
import type { KaggleResult } from "./types";

const MAX_ATTEMPTS = 3;
const TEXT_TIMEOUT_MS = 30_000; // live server takes ~18s per text call
const IMAGE_TIMEOUT_MS = 45_000;

export function kaggleBaseUrl(): string | undefined {
  const raw = process.env.KAGGLE_API_URL || process.env.NEXT_PUBLIC_KAGGLE_API_URL;
  return raw?.trim().replace(/\/$/, "") || undefined;
}

export const IMAGE_CODE_MAP: Record<string, string> = {
  akiec: "Actinic keratoses",
  bcc: "Basal cell carcinoma",
  bkl: "Benign keratosis-like lesions",
  df: "Dermatofibroma",
  mel: "Melanoma",
  nv: "Melanocytic nevi (Mole)",
  vasc: "Vascular lesions",
};

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "1",
  };
  if (process.env.KAGGLE_API_KEY) h["x-api-key"] = process.env.KAGGLE_API_KEY;
  return h;
}

function parseTopK(raw: any): KaggleResult["topK"] {
  if (!Array.isArray(raw)) return undefined;
  const items = raw
    .map((t: any) => ({ label: String(t.label ?? t.illness ?? t.condition ?? ""), confidence: Number(t.confidence ?? t.prob ?? NaN) }))
    .filter((t) => t.label && Number.isFinite(t.confidence));
  return items.length ? items : undefined;
}

async function callOnce(path: string, body: unknown, timeoutMs: number): Promise<any> {
  const base = kaggleBaseUrl();
  if (!base) throw new Error("KAGGLE_API_URL not configured");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${base}${path}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      // ngrok error/interstitial pages come back as HTML
      throw new Error("non-JSON response (is the ngrok tunnel / notebook running?)");
    }
    if (json.status && json.status !== "success") throw new Error(`server error: ${json.error ?? json.status}`);
    return json;
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error(`timeout (${timeoutMs / 1000}s)`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

async function withRetries<T>(
  log: AiLogger,
  path: string,
  fn: () => Promise<T>
): Promise<T | null> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    log.kaggleTry(path, attempt, MAX_ATTEMPTS);
    try {
      return await fn();
    } catch (e: any) {
      log.kaggleFail(e.message ?? String(e), attempt, MAX_ATTEMPTS);
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 800 * attempt));
    }
  }
  return null;
}

export interface KaggleOutcome {
  result: KaggleResult | null;
  failureReason?: string;
}

export async function kaggleText(symptoms: string, log: AiLogger): Promise<KaggleOutcome> {
  if (!kaggleBaseUrl()) {
    log.kaggleFail("KAGGLE_API_URL not configured", 1, 1);
    return { result: null, failureReason: "Kaggle not configured" };
  }
  const t0 = Date.now();
  const json = await withRetries(log, "/predict-text", () =>
    callOnce("/predict-text", { symptoms }, TEXT_TIMEOUT_MS)
  );
  if (!json || !json.illness || typeof json.illness !== "string") {
    return { result: null, failureReason: "Kaggle text model unavailable or returned invalid data" };
  }
  const confidence = Number.isFinite(Number(json.confidence)) ? Number(json.confidence) : null;
  const result: KaggleResult = { label: json.illness, confidence, topK: parseTopK(json.top_k) };
  log.kaggleOk(
    `label="${result.label}"  conf=${confidence === null ? "n/a" : confidence.toFixed(2)}` +
      (result.topK ? `  top=${result.topK.slice(0, 3).map((t) => `${t.label} ${t.confidence.toFixed(2)}`).join(", ")}` : ""),
    Date.now() - t0
  );
  return { result };
}

export async function kaggleImage(imageBase64: string, log: AiLogger): Promise<KaggleOutcome> {
  if (!kaggleBaseUrl()) {
    log.kaggleFail("KAGGLE_API_URL not configured", 1, 1);
    return { result: null, failureReason: "Kaggle not configured" };
  }
  const t0 = Date.now();
  const json = await withRetries(log, "/predict-image", () =>
    callOnce("/predict-image", { image: imageBase64 }, IMAGE_TIMEOUT_MS)
  );
  if (!json || !json.condition || typeof json.condition !== "string") {
    return { result: null, failureReason: "Kaggle image model unavailable or returned invalid data" };
  }
  const code = String(json.condition);
  const label = IMAGE_CODE_MAP[code] ?? code;
  const confidence = Number.isFinite(Number(json.confidence)) ? Number(json.confidence) : null;
  const topK = parseTopK(json.top_k)?.map((t) => ({ ...t, label: IMAGE_CODE_MAP[t.label] ?? t.label }));
  log.kaggleOk(`label="${label}" (${code})  conf=${confidence === null ? "n/a" : confidence.toFixed(2)}`, Date.now() - t0);
  return { result: { label, confidence, topK } };
}

/** Quick health probe used by /api/ai/health and the startup check. */
export async function kaggleHealth(): Promise<{ online: boolean; ms: number; detail: string }> {
  const base = kaggleBaseUrl();
  if (!base) return { online: false, ms: 0, detail: "KAGGLE_API_URL not set" };
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(`${base}/health`, { headers: headers(), signal: controller.signal });
    const ct = res.headers.get("content-type") ?? "";
    if (res.ok && ct.includes("json")) return { online: true, ms: Date.now() - t0, detail: "ok" };
    // Old notebook has no /health route (404 from Flask is still proof the server is up)
    if (res.status === 404 && !ct.includes("ngrok")) {
      const body = await res.text();
      if (!/ERR_NGROK/i.test(body)) return { online: true, ms: Date.now() - t0, detail: "up (no /health route: old notebook)" };
    }
    return { online: false, ms: Date.now() - t0, detail: `HTTP ${res.status}` };
  } catch (e: any) {
    return { online: false, ms: Date.now() - t0, detail: e?.name === "AbortError" ? "timeout" : e?.message ?? "error" };
  } finally {
    clearTimeout(timer);
  }
}
