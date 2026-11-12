import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { DISCLAIMER } from "./types";
import type { AiLogger } from "./logger";
import { getSkinConditionRule } from "./rules";

export const GEMINI_MODEL = (process.env.GEMINI_MODEL || "gemini-1.5-flash").trim();
const TIMEOUT_MS = 20_000;

export function geminiKey(): string | undefined {
  const k = process.env.GEMINI_API_KEY?.trim();
  return k && !k.startsWith("#") && k.length > 10 ? k : undefined;
}
export const isGeminiActive = () => !!geminiKey();

const SYSTEM_PROMPT = `
You are a compassionate medical information assistant inside the "Smart Symptom Identifier" app.
RULES:
- Use SIMPLE language, calm and supportive tone.
- Maximum 5 short first-aid steps. NEVER recommend drug names or dosages.
- Always advise seeing a qualified professional.
- Severity: "mild" (manage at home), "moderate" (see a doctor within 1-2 days), "severe" (urgent care today), "critical" (call emergency services now).
- For critical symptoms (severe chest pain, trouble breathing, severe bleeding, stroke signs, unconsciousness, severe burns) set emergencyRequired true and severity "critical".
- Respond ONLY with JSON matching the requested schema.
`.trim();

const DetailsSchema = z.object({
  possibleIllnesses: z.array(z.string()).min(1),
  severity: z.enum(["mild", "moderate", "severe", "critical"]),
  firstAidSteps: z.array(z.string()).min(1).max(8),
  specialistType: z.string(),
  emergencyRequired: z.boolean(),
  additionalInfo: z.string(),
});
export type GeminiDetails = z.infer<typeof DetailsSchema> & { disclaimer: string };

function model() {
  const key = geminiKey();
  if (!key) throw new Error("GEMINI_API_KEY missing");
  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: { temperature: 0.2, responseMimeType: "application/json" },
  });
}

async function run(parts: any[]): Promise<GeminiDetails> {
  const result = await Promise.race([
    model().generateContent(parts),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`timeout (${TIMEOUT_MS / 1000}s)`)), TIMEOUT_MS)),
  ]);
  const text = result.response.text();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("no JSON in Gemini response");
  const parsed = DetailsSchema.parse(JSON.parse(match[0]));
  return { ...parsed, disclaimer: DISCLAIMER };
}

const SCHEMA_HINT = `{
  "possibleIllnesses": ["..."],
  "severity": "mild|moderate|severe|critical",
  "firstAidSteps": ["Step 1: ...", "Step 2: ..."],
  "specialistType": "type of doctor",
  "emergencyRequired": false,
  "additionalInfo": "short helpful explanation"
}`;

interface Ctx {
  age?: string;
  gender?: string;
}

/** Kaggle diagnosed -> Gemini only adds the details. The condition is fixed. */
export async function geminiEnrich(
  kaggleLabel: string,
  confidence: number | null,
  userText: string,
  ctx: Ctx,
  log: AiLogger,
  low: boolean
): Promise<GeminiDetails> {
  log.geminiStart(GEMINI_MODEL, "adding details to Kaggle diagnosis");
  const t0 = Date.now();
  const skinRule = getSkinConditionRule(kaggleLabel);
  try {
    const prompt = `
Our trained model diagnosed: "${kaggleLabel}"${confidence !== null ? ` (confidence ${(confidence * 100).toFixed(0)}%)` : ""}.
The condition is FIXED. Do NOT change or replace it. Put exactly this (full medical name if it is a code) as the first and only item of possibleIllnesses.
${low ? "The model confidence is LOW. In additionalInfo, include a short cautionary note that this is uncertain and a doctor should confirm." : ""}
${skinRule ? `CLINICAL DERMATOLOGY RULE:
- Known severity: "${skinRule.severity}"
- Urgency: "${skinRule.urgency}"
- Emergency Required: ${skinRule.emergencyRequired ? "true" : "false"}
- Recommended specialist: "${skinRule.specialist}"
- You MUST set "severity" to "${skinRule.severity}".
` : ""}
Patient: age group ${ctx.age || "not specified"}, gender ${ctx.gender || "not specified"}.
User description: "${userText || "image symptom check"}"
Give severity, first-aid steps, specialist type, emergencyRequired and a short explanation.
Schema:
${SCHEMA_HINT}`;
    const out = await run([prompt]);
    out.possibleIllnesses = [kaggleLabel]; // enforce: Kaggle label is the diagnosis
    if (skinRule) {
      out.severity = skinRule.severity;
      out.emergencyRequired = skinRule.emergencyRequired;
      if (skinRule.specialist) out.specialistType = skinRule.specialist;
    }
    log.geminiOk(Date.now() - t0);
    return out;
  } catch (e: any) {
    log.geminiFail(e.message ?? String(e));
    throw e;
  }
}

/** Fallback when Kaggle failed: Gemini does the whole analysis. */
export async function geminiFullText(symptoms: string, ctx: Ctx, log: AiLogger): Promise<GeminiDetails> {
  log.geminiStart(GEMINI_MODEL, "full text analysis (fallback)");
  const t0 = Date.now();
  try {
    const out = await run([
      `Patient: age group ${ctx.age || "not specified"}, gender ${ctx.gender || "not specified"}.\nSymptoms: ${symptoms}\nAnalyze and list 1-3 possible illnesses (most likely first).\nSchema:\n${SCHEMA_HINT}`,
    ]);
    log.geminiOk(Date.now() - t0);
    return out;
  } catch (e: any) {
    log.geminiFail(e.message ?? String(e));
    throw e;
  }
}

export async function geminiFullImage(
  imageBase64: string,
  mimeType: string,
  description: string | undefined,
  log: AiLogger
): Promise<GeminiDetails> {
  log.geminiStart(GEMINI_MODEL, "full image analysis (fallback)");
  const t0 = Date.now();
  try {
    const out = await run([
      { inlineData: { data: imageBase64, mimeType } },
      `The user uploaded a photo of a visible symptom. Extra description: "${description || "none"}".\nAnalyze the visible symptom and list 1-3 possible conditions (most likely first). If the image does not show a medical symptom, say so in additionalInfo.\nSchema:\n${SCHEMA_HINT}`,
    ]);
    log.geminiOk(Date.now() - t0);
    return out;
  } catch (e: any) {
    log.geminiFail(e.message ?? String(e));
    throw e;
  }
}

export async function geminiHealth(): Promise<{ online: boolean; ms: number; detail: string; model: string }> {
  const key = geminiKey();
  if (!key) return { online: false, ms: 0, detail: "GEMINI_API_KEY missing", model: GEMINI_MODEL };
  const t0 = Date.now();
  try {
    const r = await Promise.race([
      new GoogleGenerativeAI(key).getGenerativeModel({ model: GEMINI_MODEL }).generateContent("Reply OK"),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 10_000)),
    ]);
    return { online: /ok/i.test(r.response.text()), ms: Date.now() - t0, detail: "ok", model: GEMINI_MODEL };
  } catch (e: any) {
    return { online: false, ms: Date.now() - t0, detail: e?.message ?? "error", model: GEMINI_MODEL };
  }
}
