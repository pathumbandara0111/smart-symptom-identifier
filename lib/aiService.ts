import { analyzeTextSymptoms as analyzeWithGemini, analyzeImageSymptoms as analyzeImageWithGemini, MEDICAL_SYSTEM_PROMPT } from "./gemini";
import http from "https";

const KAGGLE_API_URL = process.env.NEXT_PUBLIC_KAGGLE_API_URL?.replace(/\/$/, "");
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export interface PredictionResponse {
  possibleIllnesses: string[];
  severity: string;
  firstAidSteps: string[];
  specialistType: string;
  emergencyRequired: boolean;
  additionalInfo: string;
  disclaimer: string;
  source: "kaggle" | "gemini";
}

// Map for Image Model codes (HAM10000)
const IMAGE_CODE_MAP: Record<string, string> = {
  "akiec": "Actinic keratoses",
  "bcc": "Basal cell carcinoma",
  "bkl": "Benign keratosis-like lesions",
  "df": "Dermatofibroma",
  "mel": "Melanoma",
  "nv": "Melanocytic nevi (Mole)",
  "vasc": "Vascular lesions"
};

/**
 * Smart Text Symptom Analyzer
 */
export async function identifySymptoms(symptoms: string, age?: string, gender?: string): Promise<PredictionResponse> {
  console.log("🔄 Starting AI Analysis...");

  if (KAGGLE_API_URL) {
    try {
      console.log(`🩺 [TEXT] Connecting to Kaggle...`);
      const response = await fetch(`${KAGGLE_API_URL}/predict-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === "success" && data.illness) {
          console.log(`✅ [KAGGLE SUCCESS]: Predicted -> ${data.illness}`);

          if (isGeminiActive()) {
            try {
              console.log("✨ [GEMINI]: Refining Kaggle diagnosis with medical details...");
              const refined = await getRefinedMedicalDetails(data.illness, symptoms);
              return { ...refined, source: "kaggle" };
            }
            catch (e: any) { console.warn("⚠️ Refinement skipped:", e.message); }
          }
          return getRawKaggleResponse(data.illness);
        }
      }
    } catch (error: any) { console.warn("❌ Kaggle Text API offline."); }
  }

  if (isGeminiActive()) {
    console.log("✨ [FALLBACK]: Using Gemini as Primary (Kaggle Offline)");
    const geminiResult = await analyzeWithGemini(symptoms, age, gender);
    return { ...geminiResult, source: "gemini" };
  }
  throw new Error("AI services unavailable.");
}

/**
 * Smart Image Symptom Analyzer
 */
export async function identifyImageSymptoms(imageBase64: string, mimeType: string, description?: string): Promise<PredictionResponse> {
  if (KAGGLE_API_URL) {
    try {
      console.log(`📸 [IMAGE] Sending to Kaggle (${Math.round(imageBase64.length / 1024)} KB)...`);

      const result = await new Promise<any>((resolve, reject) => {
        const url = new URL(`${KAGGLE_API_URL}/predict-image`);
        const body = JSON.stringify({ image: imageBase64 });

        const req = http.request({
          hostname: url.hostname,
          path: url.pathname,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(body),
          },
          timeout: 45000,
        }, (res) => {
          let data = "";
          res.on("data", (chunk) => data += chunk);
          res.on("end", () => {
            try { resolve(JSON.parse(data)); }
            catch (e) { reject(new Error("Invalid JSON from Kaggle")); }
          });
        });

        req.on("error", (e) => reject(e));
        req.on("timeout", () => { req.destroy(); reject(new Error("Connection Timeout")); });
        req.write(body);
        req.end();
      });

      if (result.status === "success" && result.condition) {
        const fullConditionName = IMAGE_CODE_MAP[result.condition] || result.condition;
        console.log(`✅ [KAGGLE SUCCESS]: Predicted -> ${fullConditionName}`);

        if (isGeminiActive()) {
          try {
            console.log("✨ [GEMINI]: Refining Image diagnosis with medical details...");
            const refined = await getRefinedMedicalDetails(fullConditionName, description || "Visual condition");
            return { ...refined, source: "kaggle" };
          }
          catch (e: any) { console.warn("⚠️ Image Refinement skipped:", e.message); }
        }
        return getRawKaggleResponse(fullConditionName);
      }
    } catch (error: any) {
      console.error("❌ Kaggle Image API Final Error:", error.message);
    }
  }

  if (isGeminiActive()) {
    console.log("✨ [FALLBACK]: Using Gemini Image Primary (Kaggle Offline)");
    const geminiResult = await analyzeImageWithGemini(imageBase64, mimeType, description);
    return { ...geminiResult, source: "gemini" };
  }

  throw new Error("Both Kaggle and Gemini Image AI are unavailable.");
}

function isGeminiActive() {
  return GEMINI_API_KEY && !GEMINI_API_KEY.startsWith("#") && GEMINI_API_KEY.length > 10;
}

function getRawKaggleResponse(illness: string): PredictionResponse {
  return {
    possibleIllnesses: [illness], severity: "moderate",
    firstAidSteps: ["Please consult a doctor for professional advice."],
    specialistType: "Specialist", emergencyRequired: false,
    additionalInfo: "Custom AI Analysis Complete.",
    disclaimer: "⚠️ Not medical advice.", source: "kaggle"
  };
}

async function getRefinedMedicalDetails(illness: string, originalSymptoms: string) {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash", systemInstruction: MEDICAL_SYSTEM_PROMPT });

  const prompt = `
    Our custom model identified this condition: "${illness}"
    User symptoms/context: "${originalSymptoms}"
    
    Translate "${illness}" to its full medical name if it is a code (like nv, mel, bcc).
    Then generate a professional medical response in EXACT JSON format:
    {
      "possibleIllnesses": ["Full Name of ${illness}"],
      "severity": "mild/moderate/severe/critical",
      "firstAidSteps": ["Step 1", "Step 2", "Step 3"],
      "specialistType": "Type of doctor",
      "emergencyRequired": true/false,
      "additionalInfo": "Brief explanation of the condition",
      "disclaimer": "⚠️ This is not a substitute for professional medical advice."
    }
  `;

  const result = await model.generateContent(prompt);
  const match = result.response.text().match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Could not parse AI response");
  return JSON.parse(match[0]);
}
