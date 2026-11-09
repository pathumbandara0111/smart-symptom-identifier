export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startupSelfCheck } = await import("./lib/ai");
    startupSelfCheck().catch((e) => console.error("[AI] self-check failed:", e?.message ?? e));
  }
}
