import { NextRequest, NextResponse } from "next/server";
import { aiHealth } from "@/lib/aiService";
import { rateLimit, clientIp } from "@/lib/rateLimit";

export async function GET(request: NextRequest) {
  const rl = rateLimit(`ai-health:${clientIp(request)}`, 10, 60_000);
  if (!rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  const h = await aiHealth();
  return NextResponse.json({
    success: true,
    kaggle: { online: h.kaggle.online, latencyMs: h.kaggle.ms, detail: h.kaggle.detail },
    gemini: { online: h.gemini.online, latencyMs: h.gemini.ms, model: h.gemini.model },
    mode: "kaggle-primary",
  });
}
