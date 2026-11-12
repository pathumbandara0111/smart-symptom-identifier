/**
 * AI pipeline (Kaggle models are PRIMARY):
 *   1. Red-flag rules (add warning only)
 *   2. Kaggle model (3 tries)  -> diagnosis
 *   3. Gemini adds details to the Kaggle diagnosis
 *   4. If Kaggle fails -> Gemini does the full analysis (fallback)
 * Every step is printed to the backend terminal via the AI logger.
 */
import { createLogger, logSystem } from "./logger";
import { kaggleText, kaggleImage, kaggleHealth, kaggleBaseUrl } from "./kaggle";
import { geminiEnrich, geminiFullText, geminiFullImage, geminiHealth, isGeminiActive, GEMINI_MODEL, type GeminiDetails } from "./gemini";
import { detectRedFlags, emergencyWarning, getSkinConditionRule } from "./rules";
import { DISCLAIMER, type KaggleResult, type PredictionResponse } from "./types";

export type { PredictionResponse } from "./types";

const LOW_CONF = Number(process.env.KAGGLE_CONFIDENCE_LOW ?? 0.6);
const IMAGE_NOTE =
  "ℹ️ The image model is trained on skin-lesion photos only. For other kinds of photos (eye, throat, wound, etc.) the result may be unreliable.";

async function localDetails(label: string) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const ill = await prisma.illness.findFirst({
      where: { name: { equals: label, mode: "insensitive" } },
      include: { firstAids: { orderBy: { step: "asc" } } },
    });
    if (ill && ill.firstAids.length) {
      return { steps: ill.firstAids.map((f) => f.instruction), info: ill.description };
    }
  } catch {
    /* DB optional here */
  }
  return null;
}

async function buildFromKaggle(
  k: KaggleResult,
  userText: string,
  ctx: { age?: string; gender?: string },
  log: ReturnType<typeof createLogger>,
  isImage: boolean
): Promise<PredictionResponse> {
  const lowConfidence = k.confidence !== null && k.confidence < LOW_CONF;
  const warnings: string[] = [];
  if (lowConfidence) warnings.push(`⚠️ Low model confidence (${((k.confidence ?? 0) * 100).toFixed(0)}%). Please confirm with a doctor.`);
  if (isImage) warnings.push(IMAGE_NOTE);

  const kaggleInfo = { label: k.label, confidence: k.confidence, lowConfidence, topK: k.topK };
  let details: GeminiDetails | null = null;

  if (isGeminiActive()) {
    try {
      details = await geminiEnrich(k.label, k.confidence, userText, ctx, log, lowConfidence);
    } catch {
      log.warn("Gemini enrichment failed, using Kaggle result with local first-aid data");
    }
  } else {
    log.warn("Gemini not configured, using Kaggle result only");
  }

  if (details) {
    const res: PredictionResponse = {
      ...details,
      possibleIllnesses: [k.label],
      source: "kaggle+gemini",
      kaggle: kaggleInfo,
      geminiModel: GEMINI_MODEL,
      warnings,
    };
    if (isImage) {
      const skinRule = getSkinConditionRule(k.label);
      res.severity = k.severity ?? skinRule?.severity ?? "moderate";
      res.emergencyRequired = k.emergencyRequired ?? skinRule?.emergencyRequired ?? false;
      if (skinRule?.specialist) res.specialistType = skinRule.specialist;
    }
    return res;
  }

  if (isImage && k.confidence !== null && k.confidence < 0.40) {
    return {
      possibleIllnesses: ["Inconclusive / Out-of-Distribution Image"],
      severity: "moderate",
      firstAidSteps: [
        "1. Ensure the uploaded photo is a clear, well-lit, close-up of a skin mole or spot.",
        "2. The custom model is trained strictly on HAM10000 skin lesions (moles, melanoma, carcinomas). Full faces or non-lesion skin cannot be classified.",
        "3. If you have acute facial droop, numbness, or neurological symptoms, call 1990 immediately.",
        "4. Consult a dermatologist or medical doctor for a professional clinical examination.",
      ],
      specialistType: "Dermatologist / General Practitioner",
      emergencyRequired: false,
      additionalInfo: `The custom skin lesion model returned low confidence (${((k.confidence ?? 0) * 100).toFixed(0)}%). This indicates the photo is likely out-of-distribution (not a close-up pigmented skin lesion).`,
      disclaimer: DISCLAIMER,
      source: "kaggle",
      kaggle: kaggleInfo,
      warnings: [
        `⚠️ Low model confidence (${((k.confidence ?? 0) * 100).toFixed(0)}%). Unrecognized image type for dermatological classifier.`,
        IMAGE_NOTE,
      ],
    };
  }

  const local = await localDetails(k.label);
  const skinRule = isImage ? getSkinConditionRule(k.label) : undefined;

  return {
    possibleIllnesses: [k.label],
    severity: k.severity ?? skinRule?.severity ?? "moderate",
    firstAidSteps:
      skinRule?.firstAid ??
      local?.steps ?? [
        "Rest and monitor your symptoms.",
        "Stay hydrated.",
        "Please consult a doctor for professional advice.",
      ],
    specialistType: skinRule?.specialist ?? "General Practitioner",
    emergencyRequired: k.emergencyRequired ?? skinRule?.emergencyRequired ?? false,
    additionalInfo:
      skinRule?.description ??
      local?.info ??
      "Result from the custom-trained model. Detailed guidance is temporarily unavailable.",
    disclaimer: DISCLAIMER,
    source: "kaggle",
    kaggle: kaggleInfo,
    warnings,
  };
}

function applyRedFlags(res: PredictionResponse, flags: string[]) {
  if (!flags.length) return;
  res.emergencyRequired = true;
  res.severity = "critical";
  res.warnings = [emergencyWarning(flags), ...(res.warnings ?? [])];
}

export async function identifySymptoms(symptoms: string, age?: string, gender?: string): Promise<PredictionResponse> {
  const log = createLogger();
  const t0 = Date.now();
  log.start("TEXT", `len=${symptoms.length}  age=${age || "-"}  gender=${gender || "-"}`);
  const flags = detectRedFlags(symptoms);
  if (flags.length) log.warn(`RED FLAGS detected: ${flags.join(", ")}`);
  const ctx = { age, gender };

  const { result, failureReason } = await kaggleText(symptoms, log);
  let response: PredictionResponse | null = null;

  if (result) {
    response = await buildFromKaggle(result, symptoms, ctx, log, false);
  } else if (isGeminiActive()) {
    log.fallback(`GEMINI (${GEMINI_MODEL})`, failureReason ?? "Kaggle failed");
    try {
      const g = await geminiFullText(symptoms, ctx, log);
      response = { ...g, source: "gemini-fallback", geminiModel: GEMINI_MODEL, fallbackReason: failureReason, warnings: [] };
    } catch (e: any) {
      log.fail(`both Kaggle and Gemini failed (${e.message})`, Date.now() - t0);
      throw new Error("AI services unavailable. Please try again shortly.");
    }
  } else {
    log.fail("Kaggle failed and Gemini is not configured", Date.now() - t0);
    throw new Error("AI services unavailable.");
  }

  applyRedFlags(response, flags);
  response.latencyMs = Date.now() - t0;
  log.done(response.source, response.latencyMs, `severity=${response.severity}${flags.length ? "  EMERGENCY" : ""}`);
  return response;
}

export async function identifyImageSymptoms(imageBase64: string, mimeType: string, description?: string): Promise<PredictionResponse> {
  const log = createLogger();
  const t0 = Date.now();
  log.start("IMAGE", `size=${Math.round(imageBase64.length / 1024)}KB  mime=${mimeType}  desc=${description ? "yes" : "no"}`);
  const flags = detectRedFlags(description ?? "");
  if (flags.length) log.warn(`RED FLAGS detected in description: ${flags.join(", ")}`);

  const { result, failureReason } = await kaggleImage(imageBase64, log);
  let response: PredictionResponse | null = null;

  // If Kaggle succeeded with solid confidence (>= 40%), use Kaggle result
  if (result && (result.confidence === null || result.confidence >= 0.40)) {
    response = await buildFromKaggle(result, description ?? "", {}, log, true);
  } else if (isGeminiActive()) {
    // If Kaggle returned low confidence (<40% e.g. non-skin photo) or failed, fall back to multimodal Gemini vision
    const reason = result && result.confidence !== null
      ? `Low Kaggle skin confidence (${(result.confidence * 100).toFixed(0)}% < 40%) — image may not be a skin lesion. Delegating to multimodal Gemini`
      : (failureReason ?? "Kaggle failed");
    log.fallback(`GEMINI (${GEMINI_MODEL})`, reason);
    try {
      const g = await geminiFullImage(imageBase64, mimeType, description, log);
      response = { ...g, source: "gemini-fallback", geminiModel: GEMINI_MODEL, fallbackReason: reason, warnings: [] };
    } catch (e: any) {
      if (result) {
        log.warn("Gemini fallback failed, using low-confidence Kaggle result");
        response = await buildFromKaggle(result, description ?? "", {}, log, true);
      } else {
        log.fail(`both Kaggle and Gemini failed (${e.message})`, Date.now() - t0);
        throw new Error("Image AI services unavailable. Please try again shortly.");
      }
    }
  } else if (result) {
    // Gemini not active, use Kaggle with low-confidence warning
    response = await buildFromKaggle(result, description ?? "", {}, log, true);
  } else {
    log.fail("Kaggle failed and Gemini is not configured", Date.now() - t0);
    throw new Error("Image AI services unavailable.");
  }

  applyRedFlags(response, flags);
  response.latencyMs = Date.now() - t0;
  log.done(response.source, response.latencyMs, `severity=${response.severity}`);
  return response;
}

/** Used by /api/ai/health and the startup self-check. */
export async function aiHealth() {
  const [kaggle, gemini] = await Promise.all([kaggleHealth(), geminiHealth()]);
  return { kaggle: { ...kaggle, url: kaggleBaseUrl() ? "configured" : "missing" }, gemini };
}

let checked = false;
/** Prints "Kaggle: ONLINE/OFFLINE, Gemini: OK" once per server start. */
export async function startupSelfCheck() {
  if (checked) return;
  checked = true;
  const h = await aiHealth();
  logSystem("──────── AI SELF-CHECK ────────");
  logSystem(`Kaggle : ${h.kaggle.online ? "ONLINE " : "OFFLINE"} (${h.kaggle.ms} ms) ${h.kaggle.detail}`);
  logSystem(`Gemini : ${h.gemini.online ? "ONLINE " : "OFFLINE"} (${h.gemini.ms} ms) model=${h.gemini.model} ${h.gemini.detail}`);
  logSystem(`Mode   : Kaggle PRIMARY → Gemini adds details → Gemini FALLBACK if Kaggle fails`);
  logSystem("───────────────────────────────");
}
