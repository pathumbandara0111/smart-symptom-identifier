/**
 * Backend terminal logger for the AI pipeline.
 * One request id per analysis so concurrent requests can be told apart.
 * NEVER log API keys.
 */
const C = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  bold: "\x1b[1m",
};

const useColor = process.env.NO_COLOR === undefined;
const paint = (c: string, s: string) => (useColor ? `${c}${s}${C.reset}` : s);

export function newRequestId(): string {
  return Math.random().toString(16).slice(2, 6);
}

export interface AiLogger {
  id: string;
  start(kind: "TEXT" | "IMAGE", detail: string): void;
  kaggleTry(endpoint: string, attempt: number, max: number): void;
  kaggleOk(summary: string, ms: number): void;
  kaggleFail(reason: string, attempt: number, max: number): void;
  geminiStart(model: string, purpose: string): void;
  geminiOk(ms: number, extra?: string): void;
  geminiFail(reason: string): void;
  fallback(to: string, reason: string): void;
  warn(msg: string): void;
  done(source: string, totalMs: number, extra?: string): void;
  fail(reason: string, totalMs: number): void;
}

export function createLogger(): AiLogger {
  const id = newRequestId();
  const tag = paint(C.cyan, `[AI #${id}]`);
  const out = (s: string) => console.log(`${tag} ${s}`);
  return {
    id,
    start: (kind, detail) => out(`[START] ${kind} request: ${detail}`),
    kaggleTry: (endpoint, a, m) => out(`[KAGGLE] POST ${endpoint} (attempt ${a}/${m})`),
    kaggleOk: (s, ms) => out(`${paint(C.green, "[KAGGLE:OK]")} ${s} (${(ms / 1000).toFixed(1)}s)`),
    kaggleFail: (r, a, m) => out(`${paint(C.red, "[KAGGLE:FAIL]")} reason=${r} (attempt ${a}/${m})`),
    geminiStart: (model, purpose) => out(`[GEMINI] (${model}) ${purpose}...`),
    geminiOk: (ms, extra) => out(`${paint(C.green, "[GEMINI:OK]")} (${(ms / 1000).toFixed(1)}s)${extra ? " " + extra : ""}`),
    geminiFail: (r) => out(`${paint(C.red, "[GEMINI:FAIL]")} reason=${r}`),
    fallback: (to, r) => out(`${paint(C.yellow, "[FALLBACK]")} -> ${to} (${r})`),
    warn: (m) => out(`${paint(C.yellow, "[WARN]")} ${m}`),
    done: (src, ms, extra) =>
      out(`${paint(C.magenta, "[DONE]")} source=${src} | total=${(ms / 1000).toFixed(1)}s${extra ? " | " + extra : ""}`),
    fail: (r, ms) => out(`${paint(C.red, "[FAIL]")} ${r} | total=${(ms / 1000).toFixed(1)}s`),
  };
}

export const logSystem = (msg: string) => console.log(`${paint(C.cyan, "[AI]")} ${msg}`);
